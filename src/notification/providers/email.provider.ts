import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';


@Injectable()
export class SmtpEmailProvider{
	private readonly transport;

	constructor(private readonly config: ConfigService) {
		this.transport = createTransport({
			service:'gmail',
			host: config.get('SMTP_HOST'),
			port: +(config.get('SMTP_PORT')),
			secure:false,
			connectionTimeout: 5000,
			greetingTimeout: 5000,
			socketTimeout: 10000,
			auth: { 
				user: config.get('SMTP_USER'), 
				pass: config.get('SMTP_PASS') },
		});
	}

	async send(to: string, subject: string, text: string) {
		await this.transport.sendMail(
			{ 
				from: this.config.get('MAIL_FROM'),
				to,
				subject,
				text
			}
		);
	}
}
