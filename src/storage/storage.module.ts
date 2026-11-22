import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';

@Module({
	providers: [
		{
			provide: 's3',
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				new S3Client({
					region: config.getOrThrow('AWS_REGION'),
					endpoint: config.get('S3_ENDPOINT'),
					forcePathStyle: config.get('S3_FORCE_PATH_STYLE') === 'true',
					credentials: {
						accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
						secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
					},
				}),
		},
		StorageService,
	],
	exports: [StorageService],
})
export class StorageModule {}
