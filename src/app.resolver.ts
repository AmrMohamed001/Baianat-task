import { Query, Resolver } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';

@Resolver()
export class AppResolver {
  constructor(private readonly i18n: I18nService) {}

  @Query(() => String)
  hello(): string {
    return this.i18n.t('common.hello');
  }
}
