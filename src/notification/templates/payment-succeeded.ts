import { Template } from './template';

export const paymentSucceeded: Template = (d) => ({
	subject: 'Payment received',
	text: `Your payment for checkout #${d.checkoutId} was successful.`,
});
