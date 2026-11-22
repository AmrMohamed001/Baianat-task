import { registerEnumType } from '@nestjs/graphql';

export enum ImageContentType {
	JPEG = 'image/jpeg',
	PNG = 'image/png',
	WEBP = 'image/webp',
}

registerEnumType(ImageContentType, { name: 'ImageContentType' });
