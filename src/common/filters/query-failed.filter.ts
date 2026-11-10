import { Catch, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { QueryFailedError } from 'typeorm';
import type { DatabaseError } from 'pg';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements GqlExceptionFilter {
	catch(exception: QueryFailedError<DatabaseError>) {
		const { code, detail } = exception.driverError;

		if (code === '23505')// unique violation
        {
			throw new BadRequestException(detail);
		}
		if (code === '23503') // foreign key violation
        {
			throw new BadRequestException(
				'Cannot delete or update because of related records in other tables.',
			);
		}
		throw new InternalServerErrorException();
	}
}
