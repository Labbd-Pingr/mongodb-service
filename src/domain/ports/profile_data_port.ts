import Account from '../model/account';
import Profile from '../model/profile';

export interface ProfileQuery {
  id?: string;
  username?: string;
  bio?: string;
  name?: string;
  birthDate?: Date;
}

export default interface IProfileDataPort {
  create: (profile: Profile) => Promise<string>;
  get: (query: ProfileQuery) => Promise<Profile[]>;
  getByUsernameMatch: (username: string) => Promise<Profile[]>;
  getAccountByProfileId: (profileId: string) => Promise<Account>;
  update: (id: string, profile: Profile) => Promise<Profile>;
  deleteById: (id: string) => Promise<boolean>;
  doesFollow: (profileId1: string, profileId2: string) => Promise<boolean>;
  follow: (profileId1: string, profileId2: string) => Promise<void>;
  unfollow: (profileId1: string, profileId2: string) => Promise<void>;
  block: (profileId1: string, profileId2: string) => Promise<void>;
  unblock: (profileId1: string, profileId2: string) => Promise<void>;
}
