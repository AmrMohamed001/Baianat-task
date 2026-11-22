export interface UploadProfile {
	maxBytes: number;
	types: string[];
	prefix: (ownerId: number) => string;
}

export const uploadProfiles: Record<string, UploadProfile> = {
	productImage: {
		maxBytes: 5 * 1024 * 1024,
		types: ['image/jpeg', 'image/png', 'image/webp'],
		prefix: (productId: number) => `products/${productId}`,
	},
	userPhoto: {
		maxBytes: 2 * 1024 * 1024,
		types: ['image/jpeg', 'image/png', 'image/webp'],
		prefix: (userId: number) => `users/${userId}`,
	},
};
