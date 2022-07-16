import Account from '../model/account';

export interface AccountQuery {
  id?: string;
}

export default interface IAccountDataPort {
  create: (account: Account, profileId: string) => Promise<string>;
  get: (query: AccountQuery) => Promise<Account[]>;
  isLoggedIn: (sccountId: string) => Promise<boolean>;
  logIn: (accountId: string) => Promise<string>;
  deleteById: (id: string) => Promise<boolean>;
}
