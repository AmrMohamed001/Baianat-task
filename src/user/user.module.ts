import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserResolver } from './user.resolver';
import { StorageModule } from '../storage/storage.module';
@Module({
	imports: [TypeOrmModule.forFeature([User]), StorageModule],
	providers: [UserService, UserResolver],
	exports: [UserService],
})
export class UserModule {}
