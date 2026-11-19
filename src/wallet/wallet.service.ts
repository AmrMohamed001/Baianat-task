import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { EntityManager, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { PaginationArgs } from '../common/query/types/pagination.args';
import { paginate } from '../common/query/paginate';
import { TransactionsArgs } from './dtos/transactions.args';
import { Vendor } from '../vendor/vendor.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
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

  transactions(walletId: number, args: PaginationArgs) {
    const qb = this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId })
      .orderBy('transaction.createdAt', 'DESC')
      .addOrderBy('transaction.id', 'DESC');
    return paginate(qb, args);
  }

  allTransactions(args: TransactionsArgs) {
    const { type, vendorId, orderId, from, to } = args;
    if (from && to && from > to) throw new BadRequestException(this.i18n.t('exceptions.DATE_FROM_AFTER_TO'));

    const qb = this.transactionRepo
      .createQueryBuilder('transaction')
      .orderBy('transaction.createdAt', 'DESC')
      .addOrderBy('transaction.id', 'DESC');
    if (type) qb.andWhere('transaction.type = :type', { type });
    if (orderId) qb.andWhere('transaction.orderId = :orderId', { orderId });
    if (from) qb.andWhere('transaction.createdAt >= :from', { from });
    if (to) qb.andWhere('transaction.createdAt <= :to', { to });
    if (vendorId)
      qb.innerJoin('transaction.wallet', 'wallet')
        .innerJoin(Vendor, 'vendor', 'vendor.ownerId = wallet.userId')
        .andWhere('vendor.id = :vendorId', { vendorId });
    return paginate(qb, args);
  }

    // wallet trans + transs creation
  async applyTransaction(manager: EntityManager, userId: number, type: TransactionType, amount: number, link: { orderId?: number; paymentIntentId?: string } = {}) {
    const wallet = await manager.findOne(Wallet, { where: { userId }, lock: { mode: 'pessimistic_write' } });
    if (!wallet) throw new NotFoundException(this.i18n.t('exceptions.NOT_FOUND_WALLET'));

    const signed = type === TransactionType.Sale ? amount : -amount;
    if (wallet.balance + signed < 0) throw new BadRequestException(this.i18n.t('exceptions.INSUFFICIENT_BALANCE'));

    await manager.update(Wallet, wallet.id, { balance: wallet.balance + signed });
    return manager.save(manager.create(Transaction, { walletId: wallet.id, type, amount: signed, orderId: link.orderId ?? null, paymentIntentId: link.paymentIntentId ?? null }));
  }
}
