import { Template } from './template';
import { vendorApproved } from './vendor-approved';
import { vendorRejected } from './vendor-rejected';
import { orderStatusChanged } from './order-status-changed';
import { orderRefunded } from './order-refunded';
import { paymentSucceeded } from './payment-succeeded';
import { paymentFailed } from './payment-failed';

export const templates: Record<string, Template> = {
	'vendor-approved': vendorApproved,
	'vendor-rejected': vendorRejected,
	'order-status-changed': orderStatusChanged,
	'order-refunded': orderRefunded,
	'payment-succeeded': paymentSucceeded,
	'payment-failed': paymentFailed,
};
