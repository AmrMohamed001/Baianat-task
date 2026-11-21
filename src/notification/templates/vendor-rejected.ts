import { Template } from './template';

export const vendorRejected: Template = (d) => ({
	subject: 'Your store was rejected',
	text: `Your vendor application #${d.vendorId} has been rejected.`,
});
