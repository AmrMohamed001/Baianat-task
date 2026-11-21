import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { EntityManager, Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { VendorStatus } from './enums/vendor-status.enum';
import { VendorsArgs } from './dtos/vendors.args';
import { NotificationService } from '../notification/notification.service';
import { paginate } from '../common/query/paginate';

export interface CreateVendorData {
  storeName: string;
  description?: string | null;
}

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    private readonly notifications: NotificationService,
    private readonly config: ConfigService,
    private readonly i18n: I18nService,
    private readonly logger: Logger,
  ) {}

  create(ownerId: number, data: CreateVendorData, manager?: EntityManager){
    const repo = manager?.getRepository(Vendor) ?? this.vendorRepo;

    const vendor = repo.create({
      ownerId,
      storeName: data.storeName,
      description: data.description ?? null,
      status: VendorStatus.Pending,
      commissionRate: Number(this.config.get('DT_COMMISSION_RATE')),
    });

    return repo.save(vendor);
  }

  findByOwner(ownerId: number) {
    return this.vendorRepo.findOne({ where: { ownerId } });
  }

  async findMyStore(ownerId: number) {
    const vendor = await this.findByOwner(ownerId);
    if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
    return vendor;
  }

  findAll(args: VendorsArgs) {
    const qb = this.vendorRepo.createQueryBuilder('v').orderBy('v.createdAt', 'DESC').addOrderBy('v.id', 'DESC');
    if (args.status) qb.andWhere('v.status = :status', { status: args.status });
    return paginate(qb, args);
  }

  async setCommission(vendorId: number, commissionRate: number) {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
    await this.vendorRepo.update(vendorId, { commissionRate });
    return Object.assign(vendor, { commissionRate });
  }

  async approve(vendorId: number, adminId: number) {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
    if (vendor.status === VendorStatus.Verified)
      throw new BadRequestException(this.i18n.t('exceptions.VENDOR_ALREADY_VERIFIED'));

    const changes = { status: VendorStatus.Verified, reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: null };
    const res = await this.vendorRepo.update({ id: vendorId, status: vendor.status }, changes); // race guard instead of transacs
    if (!res.affected) throw new ConflictException(this.i18n.t('exceptions.VENDOR_ALREADY_DECIDED'));

    this.notifications.send('vendor-approved', { vendorId, userId: vendor.ownerId });
    return Object.assign(vendor, changes);
  }

  async reject(vendorId: number, adminId: number, reason?: string | null) {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
    if (vendor.status === VendorStatus.Verified)
      throw new BadRequestException(this.i18n.t('exceptions.VENDOR_ALREADY_VERIFIED'));
    if (vendor.status === VendorStatus.Rejected)
      throw new BadRequestException(this.i18n.t('exceptions.VENDOR_ALREADY_REJECTED'));

    const changes = { status: VendorStatus.Rejected, reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: reason || null };
    const res = await this.vendorRepo.update({ id: vendorId, status: vendor.status }, changes);
    if (!res.affected) throw new ConflictException(this.i18n.t('exceptions.VENDOR_ALREADY_DECIDED'));

    this.notifications.send('vendor-rejected', { vendorId, userId: vendor.ownerId });
    return Object.assign(vendor, changes);
  }
}
