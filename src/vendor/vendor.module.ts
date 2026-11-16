import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Vendor } from './vendor.entity';
import { VendorService } from './vendor.service';
import { VendorResolver } from './vendor.resolver';
import { PublicVendorResolver } from './public-vendor.resolver';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [TypeOrmModule.forFeature([Vendor]), BullModule.registerQueue({ name: 'mail' }), DataloaderModule],
	providers: [VendorService, VendorResolver, PublicVendorResolver],
	exports: [VendorService],
})
export class VendorModule {}
