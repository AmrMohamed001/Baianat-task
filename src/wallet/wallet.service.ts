import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
  ) {}

  createForUser(userId: number, manager?: EntityManager){
    const repo = manager?.getRepository(Wallet) ?? this.walletRepo;
    const wallet = repo.create({ userId, balance: 0 });

    return repo.save(wallet);
  }
}