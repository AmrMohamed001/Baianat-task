import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
	constructor(
		@InjectQueue('notifications') private readonly queue: Queue,
		private readonly logger: Logger,
	) {}

	send(template: string, data: Record<string, any>) {
		this.queue.add(template, data).catch((e) => this.logger.error(e.message, e.stack));
	}
}
