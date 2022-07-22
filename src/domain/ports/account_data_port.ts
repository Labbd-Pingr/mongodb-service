import Account from '../model/account';

export interface AccountQuery {
  id?: string;
}

export default interface IAccountDataPort {
  create: (account: Account, profileId: string) => Promise<Account>;
  get: (query: AccountQuery) => Promise<Account[]>;
  deleteById: (id: string) => Promise<boolean>;
}
