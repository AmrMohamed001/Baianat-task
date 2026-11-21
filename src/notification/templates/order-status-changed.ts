import { Template } from './template';

export const orderStatusChanged: Template = (d) => ({
	subject: `Order #${d.orderId} status changed`,
	text: `Order #${d.orderId} changed from ${d.from} to ${d.to} at ${d.at}.`,
});
