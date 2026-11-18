import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { I18nService } from 'nestjs-i18n';
import { QueryFailedError } from 'typeorm';
import type { DatabaseError } from 'pg';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements GqlExceptionFilter {
  constructor(private readonly i18n: I18nService,private readonly logger: Logger) {}
  catch(exception: QueryFailedError<DatabaseError>, host: ArgumentsHost) {
    if (host.getType() === 'http') { // webhook
      const res = host.switchToHttp().getResponse();
      if (exception.driverError.code === '23505') return res.status(200).json({ received: true });
      this.logger.error(exception.message, exception.stack); 
      return res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }

    const { code, detail = '' } = exception.driverError;

    if (code === '23505') { //unique violation
      const field = detail.slice(detail.indexOf('(') + 1, detail.indexOf(')=')).replace(/lower\(|"|::\w+|[()]/g, '');
      const label = this.i18n.t(`fields.${field}`, { defaultValue: field });
      return new GraphQLError(this.i18n.t('exceptions.DUPLICATE_FIELD', { args: { field: label } }), {
        extensions: { code: 'DUPLICATE_FIELD', field },
      });
    }

    if (code === '23503')
      return new GraphQLError(this.i18n.t('exceptions.FOREIGN_KEY_VIOLATION'), {
        extensions: { code: 'FOREIGN_KEY_VIOLATION' },
      });

    this.logger.error(exception.message, exception.stack);
    return new GraphQLError(this.i18n.t('exceptions.INTERNAL_SERVER_ERROR'), {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
}