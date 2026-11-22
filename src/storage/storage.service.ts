import { randomUUID } from 'node:crypto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { I18nService } from 'nestjs-i18n';
import { UploadProfile } from './upload-profiles';



@Injectable()
export class StorageService {
	private readonly bucket: string;
	constructor(
		@Inject('s3') private readonly s3: S3Client,
		private config: ConfigService,
		private readonly i18n: I18nService
	) {
		this.bucket = config.getOrThrow('S3_BUCKET');
	}

	async createPresignedUpload(profile: UploadProfile, ownerId: number, contentType: string) {
		const key = `${profile.prefix(ownerId)}/${randomUUID()}`;
		const { url, fields } = await createPresignedPost(this.s3, {
			Bucket: this.bucket,
			Key: key,
			Fields: { 'Content-Type': contentType },
			Conditions: [
				['content-length-range', 1, profile.maxBytes],
				['eq', '$Content-Type', contentType], // Content-Type=contentType
			],
			Expires: +this.config.getOrThrow('S3_UPLOAD_EXPIRES_SECONDS'),
		});
		return { url, fields, key, expiresAt: new Date(Date.now() + +this.config.getOrThrow('S3_UPLOAD_EXPIRES_SECONDS')* 1000) };
	}

	async verifyUpload(profile: UploadProfile, ownerId: number, key: string) {
		if (!key.startsWith(`${profile.prefix(ownerId)}/`)) throw new BadRequestException(this.i18n.t('exceptions.INVALID_UPLOAD_KEY'));

		const head = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key })).catch((e) => {
			if (e.name === 'NotFound') throw new BadRequestException(this.i18n.t('exceptions.UPLOAD_NOT_FOUND'));
			throw e;
		});
		if (!head.ContentLength || head.ContentLength > profile.maxBytes || !profile.types.includes(head.ContentType ?? ''))
			throw new BadRequestException(this.i18n.t('exceptions.INVALID_UPLOAD'));
	}

	async deleteObject(key: string) {
		await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
	}

	urlFor(key: string) {
		return `${this.config.getOrThrow('S3_PUBLIC_URL')}/${key}`;
	}
}
