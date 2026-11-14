import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { EntityManager, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    private readonly i18n: I18nService,
  ) {}

  createForUser(userId: number, manager?: EntityManager){
    const repo = manager?.getRepository(Wallet) ?? this.walletRepo;
    const wallet = repo.create({ userId, balance: 0 });

    return repo.save(wallet);
  }

  async findByUser(userId: number) {
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_WALLET'));
    return wallet;
  }
}
