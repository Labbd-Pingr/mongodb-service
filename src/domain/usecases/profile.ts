import { runInThisContext } from 'vm';
import Profile from '../model/profile';
import IAccountDataPort from '../ports/account_data_port';
import ILoginDataPort from '../ports/login_data_port';
import IProfileDataPort, { ProfileQuery } from '../ports/profile_data_port';
import { UsecaseResponse } from './interfaces/interface';
import { IUpdateProfile } from './interfaces/interface.profile';
import SessionUsecases from './session';

export default class ProfileUsecases {
  private readonly sessionUsecases: SessionUsecases;
  constructor(
    private readonly profileDataPort: IProfileDataPort,
    private readonly accountDataPort: IAccountDataPort,
    loginDataPort: ILoginDataPort
  ) {
    this.sessionUsecases = new SessionUsecases(loginDataPort);
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

  public async followOrUnfollow(
    sessionId: string,
    profileId: string
  ): Promise<UsecaseResponse<string>> {
    const authResponse = await this.sessionUsecases.getAndValidateSession(
      sessionId
    );
    if (!authResponse.succeed) return authResponse;

    const accountId = authResponse.response;
    const accounts = await this.accountDataPort.get({ id: accountId });

    if (accounts.length == 0)
      return {
        succeed: false,
        errors: 'Internal Error',
      };

    const profile = accounts[0].profile;

    if (await this.profileDataPort.doesFollow(profile.id, profileId)) {
      await this.profileDataPort.unfollow(profile.id, profileId);
      return {
        succeed: true,
        response: `Unfollow user with id ${profileId}`,
      };
    } else {
      await this.profileDataPort.follow(profile.id, profileId);
      return {
        succeed: true,
        response: `Follow user with id ${profileId}`,
      };
    }
  }
}
