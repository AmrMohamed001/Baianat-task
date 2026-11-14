import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
export const CurrentVendor = createParamDecorator(
	(data: never, context: ExecutionContext) => {
		const { req } = GqlExecutionContext.create(context).getContext();
		return req.vendor;
	}
);
