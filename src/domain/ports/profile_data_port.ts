import Profile from '../model/profile';

export interface ProfileQuery {
  id?: string;
  username?: string;
  bio?: string;
  name?: string;
  birthDate?: Date;
}

export default interface IProfileDataPort {
  create: (profile: Profile) => Promise<string | undefined>;
  get: (query: ProfileQuery) => Promise<Profile[]>;
  getByUsernameMatch: (username: string) => Promise<Profile[]>;
  update: (id: string, profile: Profile) => Promise<string | undefined>;
}
