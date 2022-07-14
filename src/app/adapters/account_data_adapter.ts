import { Driver, Session } from 'neo4j-driver';
import { DataSource, Repository } from 'typeorm';
import Account from '../../domain/model/account';
import IAccountDataPort from '../../domain/ports/account_data_port';
import Neo4jRepository from '../neo4j/neo4j_repository';
import { AccountModel } from '../postgresql/model/account';
import { ProfileModel } from '../postgresql/model/profile';

export default class AccountDataAdapter implements IAccountDataPort {
  private accountRepository: Repository<AccountModel>;
  private profileRepository: Repository<ProfileModel>;
  private neo4j: Neo4jRepository;

  constructor(postgres: DataSource, neo4j: Neo4jRepository) {
    this.accountRepository = postgres.getRepository('account');
    this.profileRepository = postgres.getRepository('profile');
    this.neo4j = neo4j;
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

    // Add to postgres
    convertedAccount = await this.accountRepository.save(convertedAccount);
    const id = convertedAccount.id.toString();

    //TODO: Add instance in neo4j
    this.neo4j.runCommand('CREATE (:user {accountId: $id})', { id });

    //TODO: Add instance in redis
    return id;
  }


  private convertDomainToApp(account: Account): AccountModel {
    const convertedAccount = new AccountModel();
    convertedAccount.email = account.email;
    convertedAccount.password = account.password;
    return convertedAccount;
  }
}
