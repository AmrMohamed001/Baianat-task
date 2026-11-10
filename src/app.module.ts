import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { AppResolver } from './app.resolver.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { APP_FILTER } from '@nestjs/core';
import { QueryFailedExceptionFilter } from './common/filters/query-failed.filter.js';
import { DatabaseModule } from './database/database.module.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),

    ObserveModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        appKey: config.get<string>('OBSERVE_APP_KEY'),
        appSecret: config.get<string>('OBSERVE_APP_SECRET'),
        serviceId: 'starter-ql',
      }),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			playground: true,
			path: '/graphql',
		}),
    
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: join(import.meta.dirname, 'common/i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),

        ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 10,
			},
		]),
    
    LoggerModule,
    DatabaseModule,

  ],
  providers: [
    AppResolver,
    {
			provide: APP_FILTER,
			useClass: QueryFailedExceptionFilter,
		},
  ],
})
export class AppModule {}
