import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
	// stub until the Stripe task
	async createIntent(amount: number, checkoutId: number) {
		return { id: `pi_test_${checkoutId}` };
	}

	async refund(checkoutId: number, amount: number) {
		return { id: `re_test_${checkoutId}` };
	}
}
