import Account from '../model/account';
import Profile from '../model/profile';
import IAccountDataPort from '../ports/account_data_port';
import IProfileDataPort from '../ports/profile_data_port';
import { ICreateAccount } from './interface.account';

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
  }: ICreateAccount): Promise<string | null> {
    try {
      const profile: Profile = new Profile(username, name, bio, birthDate);
      const account: Account = new Account(email, password, profile);

      const profileDbId = await this.profileDataPort.create(profile);
      if (!profileDbId) throw new Error();
      const accountDbId = await this.accountDataPort.create(
        account,
        profileDbId
      );
      if (!accountDbId) throw new Error();

      return accountDbId;
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Account was not able to be created! ${error.message}`
      );
      return null;
    }
  }
}
