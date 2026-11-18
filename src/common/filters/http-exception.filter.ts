import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
// to solve apolo's server missing codes (INTERNAL_SERVER_ERROR)
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    // webhook bad sign case
    if (host.getType() === 'http') return host.switchToHttp().getResponse().status(status).json(exception.getResponse());

    const code = status === HttpStatus.UNAUTHORIZED ? 'UNAUTHENTICATED' : HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';

    return new GraphQLError(exception.message, {
      extensions: { code, originalError: exception.getResponse() },
    });
  }
}
