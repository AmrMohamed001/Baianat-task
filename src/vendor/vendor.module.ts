import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './vendor.entity';
import { VendorService } from './vendor.service';

@Module({
	imports: [TypeOrmModule.forFeature([Vendor])],
	providers: [VendorService],
	exports: [VendorService],
})
export class VendorModule {}
