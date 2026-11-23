import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { EntityManager, Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { VendorStatus } from './enums/vendor-status.enum';
import { VendorsArgs } from './dtos/vendors.args';
import { NotificationService } from '../notification/notification.service';
import { QueryService } from '../common/query/query.service';
import { PopularVendorsArgs } from './dtos/popular-vendors.args';
import { Order } from '../order/entities/order.entity';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentStatus } from '../order/enums/payment-status.enum';

export interface CreateVendorData {
  storeName: string;
  description?: string | null;
}

@Injectable()
export class VendorService {
  constructor(
		private readonly query: QueryService,
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
    const qb = this.vendorRepo.createQueryBuilder('v');
    this.query.sort(qb, 'createdAt');
    if (args.status) qb.andWhere('v.status = :status', { status: args.status });
    return this.query.getPage(qb, args);
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

    this.notifications.send('vendor-approved', { storeName: vendor.storeName, userId: vendor.ownerId });
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

    this.notifications.send('vendor-rejected', { storeName: vendor.storeName, userId: vendor.ownerId });
    return Object.assign(vendor, changes);
  }

  async popularVendors({ from, to, page, limit }: PopularVendorsArgs) {
    if (from && to && from > to) throw new BadRequestException(this.i18n.t('exceptions.DATE_FROM_AFTER_TO'));

    const scs = { rating: 0.4, sales: 0.6};

    const qb = this.vendorRepo
      .createQueryBuilder('vendor')
      .leftJoin(
        Order,'order',
        'order.vendorId = vendor.id AND order.paymentStatus = :paid AND order.status != :cancelled AND order.createdAt BETWEEN :from AND :to',
        { paid: PaymentStatus.Paid, cancelled: OrderStatus.Cancelled, from: from ?? new Date(0), to: to ?? new Date() }
      )
      .where('vendor.status = :verified', { verified: VendorStatus.Verified })
      .andWhere('(vendor."reviewsCount" > 0 OR order.id IS NOT NULL)') 
      .addSelect('COUNT(order.id)', 'salesCount')
      .addSelect(
        `${scs.rating} * coalesce(vendor."averageRating", 0) / 5` +
      ` + ${scs.sales} * count(order.id)::float / (count(order.id) + 10)`, 'score')
      .groupBy('vendor.id')
      .orderBy('"score"', 'DESC')
      .addOrderBy('"salesCount"', 'DESC')
      .addOrderBy('vendor.id', 'ASC');

    this.query.paginate(qb, { page, limit });

    const { entities, raw } = await qb.getRawAndEntities();
    const total = await qb.getCount();
    return {
      data: entities.map((vendor, i) => ({
        vendor,
        salesCount: Number(raw[i].salesCount),
        score: Number(raw[i].score),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
