import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { Order } from '../order/entities/order.entity';
import { Vendor } from '../vendor/vendor.entity';
import { DataloaderModule } from '../dataloader/dataloader.module';

@Module({
	imports: [TypeOrmModule.forFeature([Review, Order, Vendor]), DataloaderModule],
	providers: [ReviewService, ReviewResolver],
})
export class ReviewModule {}
