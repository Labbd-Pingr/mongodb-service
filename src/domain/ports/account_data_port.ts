import Account from '../model/account';

export default interface IAccountDataPort {
  create: (account: Account, profileId: string) => Promise<string | undefined>;
}
