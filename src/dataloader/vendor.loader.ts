import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { Vendor } from '../vendor/vendor.entity';

@Injectable({ scope: Scope.REQUEST })
export class VendorLoader {
	constructor(@InjectRepository(Vendor) private repo: Repository<Vendor>) {}

	//product.vendor
	byId = new DataLoader(async (ids: readonly number[]) => {
		const vendors = await this.repo.find({ where: { id: In([...ids]) }, relations: { owner: true } });
		return ids.map((id) => vendors.find((v) => v.id === id) ?? null);
	});
}
