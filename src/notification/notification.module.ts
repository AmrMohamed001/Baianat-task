import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { User } from '../user/user.entity';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { SmtpEmailProvider } from './providers/email.provider';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		BullModule.registerQueue({
			name: 'notifications',
			defaultJobOptions: {
				attempts: 3,
				backoff: { type: 'exponential', delay: 1000 },
				removeOnComplete: true,
				removeOnFail: false,
			},
		}),
	],
	providers: [
		NotificationService,
		NotificationProcessor,
		SmtpEmailProvider,
	],
	exports: [NotificationService],
})
export class NotificationModule {}
