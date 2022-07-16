import Account from '../model/account';
import Profile from '../model/profile';
import IAccountDataPort from '../ports/account_data_port';
import IProfileDataPort from '../ports/profile_data_port';
import { ICreateAccount, UsecaseResponse } from './interface.account';

export default class AccountUsecases {
  constructor(
    private readonly accountDataPort: IAccountDataPort,
    private readonly profileDataPort: IProfileDataPort
  ) {}

  public async createAccount({
    email,
    password,
    username,
    name,
    bio,
    birthDate,
  }: ICreateAccount): Promise<UsecaseResponse<string>> {
    let profileDbId = '0',
      accountDbId = '0';
    try {
      const profile: Profile = new Profile(username, name, bio, birthDate);
      const account: Account = new Account(email, password, profile);

      profileDbId = await this.profileDataPort.create(profile);
      if (!profileDbId) throw new Error('[INTERNAL ERROR]');

      accountDbId = await this.accountDataPort.create(account, profileDbId);
      if (!accountDbId) throw new Error('[INTERNAL ERROR]');

      return {
        succeed: true,
        response: accountDbId,
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Account was not able to be created! ${error.message}`
      );

      await this.profileDataPort.deleteById(profileDbId);
      await this.accountDataPort.deleteById(accountDbId);
      return {
        succeed: false,
        errors: error.message,
      };
    }
  }

  public async getAccountById(id: string): Promise<UsecaseResponse<Account>> {
    const accounts = await this.accountDataPort.get({ id });
    if (accounts.length == 0) {
      console.log(`[ERROR] Could not get account with id ${id}`);
      return {
        succeed: false,
        errors: 'Not Found',
      };
    }

    return {
      succeed: true,
      response: accounts[0],
    };
  }

  public async isAccountLogged(id: string): Promise<UsecaseResponse<boolean>> {
    try {
      return {
        succeed: true,
        response: await this.accountDataPort.isLoggedIn(id),
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Account was not able to be created! ${error.message}`
      );
      return {
        succeed: false,
        errors: error.message,
      };
    }
  }

  public async loginAccount(
    accountId: string,
    password: string
  ): Promise<UsecaseResponse<string>> {
    const getResponse = await this.getAccountById(accountId);

    if (!getResponse.response)
      return { succeed: false, errors: getResponse.errors };

    const account: Account = getResponse.response;
    if (account.password != password)
      return {
        succeed: false,
        errors: `Invalid password for account with id ${accountId}`,
      };

    const sessionId = await this.accountDataPort.logIn(accountId);
    return {
      succeed: true,
      response: sessionId,
    };
  }
}
