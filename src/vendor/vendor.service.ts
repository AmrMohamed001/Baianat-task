import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { EntityManager, Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { VendorStatus } from './enums/vendor-status.enum';

export interface CreateVendorData {
  storeName: string;
  description?: string | null;
}

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
    @InjectQueue('mail') private readonly mailQueue: Queue,
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

  async approve(vendorId: number, adminId: number) {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_VENDOR'));
    if (vendor.status === VendorStatus.Verified)
      throw new BadRequestException(this.i18n.t('exceptions.VENDOR_ALREADY_VERIFIED'));

    const changes = { status: VendorStatus.Verified, reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: null };
    const res = await this.vendorRepo.update({ id: vendorId, status: vendor.status }, changes); // race guard instead of transacs
    if (!res.affected) throw new ConflictException(this.i18n.t('exceptions.VENDOR_ALREADY_DECIDED'));

    this.mailQueue.add('vendor-approved', { vendorId, ownerId: vendor.ownerId })
      .catch((e) => this.logger.error(e.message, e.stack));
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

    this.mailQueue.add('vendor-rejected', { vendorId, ownerId: vendor.ownerId, reason: changes.rejectionReason })
      .catch((e) => this.logger.error(e.message, e.stack));
    return Object.assign(vendor, changes);
  }
}
