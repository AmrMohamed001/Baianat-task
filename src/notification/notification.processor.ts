import { InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { templates } from './templates';
import { SmtpEmailProvider } from './providers/email.provider';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
	constructor(
		@InjectRepository(User) private readonly userRepo: Repository<User>,
		private readonly email: SmtpEmailProvider,
		private readonly logger: Logger,
	) {
		super();
	}

	async process(job: Job) {
		const render = templates[job.name];
		if (!render) throw new InternalServerErrorException(`unknown notification template ${job.name}`);

		const user = await this.userRepo.findOneBy({ id: job.data.userId });
		if (!user) throw new InternalServerErrorException(`notification ${job.name}: user not found`);

		const { subject, text } = render(job.data);
		await this.email.send(user.email, subject, text);
	}

	@OnWorkerEvent('failed')
	onFailed(job: Job, err: Error) {
		const final = job.attemptsMade >= (job.opts.attempts ?? 1);
		this.logger.error(`notification ${job.name} #${job.id} failed (attempt ${job.attemptsMade}${final ? ', giving up' : ''}): ${err.message}`);
	}
}
