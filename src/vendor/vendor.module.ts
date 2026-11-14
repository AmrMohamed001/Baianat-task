import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Vendor } from './vendor.entity';
import { VendorService } from './vendor.service';
import { VendorResolver } from './vendor.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([Vendor]), BullModule.registerQueue({ name: 'mail' })],
	providers: [VendorService, VendorResolver],
	exports: [VendorService],
})
export class VendorModule {}
