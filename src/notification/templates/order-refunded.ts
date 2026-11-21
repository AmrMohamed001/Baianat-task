import { Template } from './template';

export const orderRefunded: Template = (d) => ({
	subject: `Order #${d.orderId} refunded`,
	text: `Order #${d.orderId} has been refunded.`,
});
