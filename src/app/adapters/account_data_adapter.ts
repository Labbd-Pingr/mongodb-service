import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  Repository as RepositoryP,
} from 'typeorm';
import { Repository as RepositoryR } from 'redis-om';
import Account from '../../domain/model/account';
import IAccountDataPort, {
  AccountQuery,
} from '../../domain/ports/account_data_port';
import Neo4jRepository from '../neo4j/neo4j_repository';
import { AccountModel as AccountModelP } from '../postgresql/model/account';
import { ProfileModel } from '../postgresql/model/profile';
import RedisRepository from '../redis/redis_repository';
import { AccountModel as AccountModelR } from '../redis/model/account';
import Profile from '../../domain/model/profile';

const SESSION_LIFETIME_IN_DAYS = 1;

export default class AccountDataAdapter implements IAccountDataPort {
  private readonly accountRepositoryPostgres: RepositoryP<AccountModelP>;
  private readonly profileRepositoryPostgres: RepositoryP<ProfileModel>;
  private readonly neo4jRepository: Neo4jRepository;
  private readonly accountRepositoryRedis: RepositoryR<AccountModelR>;

  constructor(
    postgres: DataSource,
    neo4j: Neo4jRepository,
    redis: RedisRepository
  ) {
    this.accountRepositoryPostgres = postgres.getRepository('account');
    this.profileRepositoryPostgres = postgres.getRepository('profile');
    this.neo4jRepository = neo4j;
    this.accountRepositoryRedis = redis.getAccountRepository();
  }

  public async create(account: Account, profileId: string): Promise<string> {
    const profiles = await this.profileRepositoryPostgres.findBy({
      id: parseInt(profileId),
    });

    if (profiles.length == 0)
      throw new Error(
        `[INTERNAL ERROR] Profile with id ${profileId} was not able to be fetched!`
      );

    let convertedAccount = this.convertDomainAccountToApp(account);
    convertedAccount.profile = profiles[0];

    // Add to postgres
    convertedAccount = await this.accountRepositoryPostgres.save(
      convertedAccount
    );
    const id = convertedAccount.id.toString();

    //Add to neo4j
    this.neo4jRepository.runCommand('CREATE (:user {accountId: $id})', { id });
    return id;
  }

  public async get(query: AccountQuery): Promise<Account[]> {
    const convertedQuery = {
      where: {
        ...query,
        ...(query.id && { id: parseInt(query.id) }),
      },
      relations: {
        profile: true,
      },
    };

    const accounts: AccountModelP[] = await this.accountRepositoryPostgres.find(
      convertedQuery as FindManyOptions<Account>
    );

    return accounts.map((account) => this.convertAppAccountToDomain(account));
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.accountRepositoryPostgres.delete(parseInt(id));
    return result.affected == 1;
  }

  public async isLoggedIn(accountId: string): Promise<boolean> {
    const session = await this.accountRepositoryRedis
      .search()
      .where('accountId')
      .equals(accountId)
      .returnFirst();

    if (session == null) return false;
    if (session.expirationDate <= Date.now()) return false;

    return true;
  }

  public async logIn(accountId: string): Promise<string> {
    let session = await this.accountRepositoryRedis
      .search()
      .where('accountId')
      .equals(accountId)
      .returnFirst();

    if (session == null) {
      session = await this.accountRepositoryRedis.createEntity({
        accountId,
      });
    }

    const expirationDate = Date.now() + SESSION_LIFETIME_IN_DAYS;

    session.expirationDate = expirationDate;
    await this.accountRepositoryRedis.save(session);
    return session.entityId;
  }

  private convertDomainAccountToApp(account: Account): AccountModelP {
    const convertedAccount = new AccountModelP();
    convertedAccount.email = account.email;
    convertedAccount.password = account.password;
    return convertedAccount;
  }

  private convertAppAccountToDomain(account: AccountModelP): Account {
    const convertedProfile = new Account(
      account.email,
      account.password,
      this.convertAppProfileToDomain(account.profile)
    );

    return convertedProfile;
  }

  private convertAppProfileToDomain(profile: ProfileModel): Profile {
    const convertedProfile = new Profile(
      profile.username,
      profile.name,
      profile.bio,
      profile.birthDate
    );

    return convertedProfile;
  }
}
