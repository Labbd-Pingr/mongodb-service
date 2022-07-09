import Profile from '../model/profile';
import IProfileDataPort, { ProfileQuery } from '../ports/profile_data_port';
import { ICreateProfile, IUpdateProfile } from './interface.profile';

export default class ProfileUsecases {
  constructor(private readonly profileDataPort: IProfileDataPort) {}

  public async createProfile({
    username,
    name,
    bio,
    birthDate,
  }: ICreateProfile): Promise<string | null> {
    try {
      const profile: Profile = new Profile(username, name, bio, birthDate);
      const dbId = await this.profileDataPort.create(profile);
      if (!dbId) throw new Error();
      return dbId;
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Profile was not able to be created! ${error.message}`
      );
      return null;
    }
  }

  public async getProfileById(id: string): Promise<Profile | null> {
    const profiles = await this.profileDataPort.get({ id });
    if (profiles.length == 0) {
      console.log(`[ERROR] Could not get profile with id ${id}`);
      return null;
    }

    return profiles[0];
  }

  public async getProfileByQuery(query: ProfileQuery): Promise<Profile[]> {
    const profiles = await this.profileDataPort.get(query);
    return profiles;
  }

  public async searchProfilesByUsernameMatch(
    username: string
  ): Promise<Profile[]> {
    const profiles = await this.profileDataPort.getByUsernameMatch(username);
    return profiles;
  }

  public async updateProfile(
    id: string,
    args: IUpdateProfile
  ): Promise<string | null> {
    const profile: Profile | null = await this.getProfileById(id);
    if (profile == null) return null;

    try {
      if (args.username) profile.username = args.username;
      if (args.bio) profile.bio = args.bio;
      if (args.name) profile.name = args.name;
      if (args.birthDate) profile.birthDate = args.birthDate;

      const dbId = await this.profileDataPort.update(id, profile);
      if (!dbId) throw new Error();
      return dbId;
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Profile was not able to be updated! ${error.message}`
      );
      return null;
    }
  }
}
