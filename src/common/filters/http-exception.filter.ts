import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException) {
    const status = exception.getStatus();
    const code = status === HttpStatus.UNAUTHORIZED ? 'UNAUTHENTICATED' : HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';

    return new GraphQLError(exception.message, { extensions: { code } });
  }
}
