import { Template } from './template';

export const paymentFailed: Template = (d) => ({
	subject: 'Payment failed',
	text: `Your payment for checkout #${d.checkoutId} has failed.`,
});
