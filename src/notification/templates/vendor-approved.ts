import { Template } from './template';

export const vendorApproved: Template = (d) => ({
	subject: 'Your store was approved',
	text: `Your vendor application #${d.vendorId} has been approved.`,
});
