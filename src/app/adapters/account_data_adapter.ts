import { DataSource, Repository } from 'typeorm';
import Account from '../../domain/model/account';
import IAccountDataPort from '../../domain/ports/account_data_port';
import { AccountModel } from '../postgresql/model/account';
import { ProfileModel } from '../postgresql/model/profile';

export default class AccountDataAdapter implements IAccountDataPort {
  private accountRepository: Repository<AccountModel>;
  private profileRepository: Repository<ProfileModel>;

  constructor(db: DataSource) {
    this.accountRepository = db.getRepository('account');
    this.profileRepository = db.getRepository('profile');
  }

  public async create(
    account: Account,
    profileId: string
  ): Promise<string | undefined> {
    const profiles = await this.profileRepository.findBy({
      id: parseInt(profileId),
    });

    if (profiles.length == 0)
      throw new Error(`[ERROR] Profile with id ${profileId} does not exist!`);

    let convertedAccount = this.convertDomainToApp(account);
    convertedAccount.profile = profiles[0];

    convertedAccount = await this.accountRepository.save(convertedAccount);
    //TODO: Add instance in neo4j
    //TODO: Add instance in redis
    return convertedAccount.id.toString();
  }

  private convertDomainToApp(account: Account): AccountModel {
    const convertedAccount = new AccountModel();
    convertedAccount.email = account.email;
    convertedAccount.password = account.password;
    return convertedAccount;
  }
}
