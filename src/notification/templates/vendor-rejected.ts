import { Template } from './template';

export const vendorRejected: Template = (d) => ({
	subject: 'Your store was rejected',
	text: `Your store ${d.storeName} has been rejected.`,
});
