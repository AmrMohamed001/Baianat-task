import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { AppResolver } from './app.resolver';
import { LoggerModule } from './common/logger/logger.module';
import { QueryModule } from './common/query/query.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { QueryFailedExceptionFilter } from './common/filters/query-failed.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { VendorModule } from './vendor/vendor.module';
import { WalletModule } from './wallet/wallet.module';
import { FollowModule } from './follow/follow.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { BullModule } from '@nestjs/bullmq';
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
      context: ({ req, res }) => ({ req, res }),
			playground: true,
			path: '/graphql',
      includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
		}),
    
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: join(__dirname, 'common/i18n'),
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
				limit: 200,
			},
		]),
    
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: Number(config.get('REDIS_PORT')),
          enableOfflineQueue: false,
        },
      }),
    }),

    LoggerModule,
    QueryModule,
    DatabaseModule,
    UserModule,
    CartModule,
    OrderModule,
    PaymentModule,
    VendorModule,
    WalletModule,
    FollowModule,
    ReviewModule,
    CategoryModule,
    ProductModule,
    WishlistModule,
    AuthModule,
  ],
  providers: [
    AppResolver,
    {
			provide: APP_FILTER,
			useClass: QueryFailedExceptionFilter,
		},
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
