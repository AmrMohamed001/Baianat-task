import { Template } from './template';

export const vendorApproved: Template = (d) => ({
	subject: `Your store ${d.storeName} was approved`,
	text: `Your store ${d.storeName} has been approved. You can now add products.`,
});
