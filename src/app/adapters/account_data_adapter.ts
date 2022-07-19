import { DataSource, FindManyOptions, Repository } from 'typeorm';
import Account from '../../domain/model/account';
import IAccountDataPort, {
  AccountQuery,
} from '../../domain/ports/account_data_port';
import Neo4jRepository from '../neo4j/neo4j_repository';
import { AccountModel } from '../postgresql/model/account';
import { ProfileModel } from '../postgresql/model/profile';
import Profile from '../../domain/model/profile';

export default class AccountDataAdapter implements IAccountDataPort {
  private readonly accountRepositoryPostgres: Repository<AccountModel>;
  private readonly profileRepositoryPostgres: Repository<ProfileModel>;
  private readonly neo4jRepository: Neo4jRepository;

  constructor(postgres: DataSource, neo4j: Neo4jRepository) {
    this.accountRepositoryPostgres = postgres.getRepository('account');
    this.profileRepositoryPostgres = postgres.getRepository('profile');
    this.neo4jRepository = neo4j;
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
    this.neo4jRepository.runCommand(
      'CREATE (:user {accountId: $id, profileId: $profileId})',
      { id, profileId }
    );
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

    const accounts: AccountModel[] = await this.accountRepositoryPostgres.find(
      convertedQuery as FindManyOptions<AccountModel>
    );

    return accounts.map((account) => this.convertAppAccountToDomain(account));
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.accountRepositoryPostgres.delete(parseInt(id));
    return result.affected == 1;
  }

  private convertDomainAccountToApp(account: Account): AccountModel {
    const convertedAccount = new AccountModel();
    convertedAccount.email = account.email;
    convertedAccount.password = account.password;
    return convertedAccount;
  }

  private convertAppAccountToDomain(account: AccountModel): Account {
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

    convertedProfile.id = profile.id.toString();
    return convertedProfile;
  }
}
