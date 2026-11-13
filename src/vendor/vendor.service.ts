import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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
    private readonly config: ConfigService,
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
}