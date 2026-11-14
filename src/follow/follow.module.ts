import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorFollow } from './follow.entity';
import { Vendor } from '../vendor/vendor.entity';
import { FollowService } from './follow.service';
import { FollowResolver } from './follow.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([VendorFollow, Vendor])],
	providers: [FollowService, FollowResolver],
})
export class FollowModule {}
