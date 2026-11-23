import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	getRequestResponse(context: ExecutionContext) {
		// rest do nothing
		if (context.getType<string>() !== 'graphql') return super.getRequestResponse(context);

		// ql {req,res}
		const { req, res } = GqlExecutionContext.create(context).getContext();
		return { req, res };
	}
}
