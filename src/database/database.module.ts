import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
              inject: [ConfigService],
              useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('DB_HOSTER'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USERNAME'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
                poolSize: config.get<number>('DB_POOL'),
                extra: {
                  min: 2,
                  idleTimeoutMillis: 30 * 1000,
                  connectionTimeoutMillis: 5 * 1000,
                },
                autoLoadEntities: true,
                synchronize: false,
                logging: config.get<string>('NODE_ENV') !== 'production',
                migrations: [__dirname + '/migrations/*{.ts,.js}'],
                migrationsRun: false,
              }),
            }),
	],
})
export class DatabaseModule {}
