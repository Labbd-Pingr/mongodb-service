import Profile from '../model/profile';
import IAccountDataPort from '../ports/account_data_port';
import IProfileDataPort, { ProfileQuery } from '../ports/profile_data_port';
import AutheticationUsecases from './auth';
import { UsecaseResponse } from './interfaces/interface';
import { IUpdateProfile } from './interfaces/interface.profile';

export default class ProfileUsecases {
  constructor(
    private readonly profileDataPort: IProfileDataPort,
    private readonly accountDataPort: IAccountDataPort
  ) {}

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

  @AutheticationUsecases.authorize()
  public async updateProfile(
    session: string,
    id: string,
    args: IUpdateProfile
  ): Promise<UsecaseResponse<Profile>> {
    const accountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(session)
    ).response;
    const accounts = await this.accountDataPort.get({ id: accountId });

    if (accounts.length == 0)
      return {
        succeed: false,
      };

    const profile = accounts[0].profile;

    if (profile.id != id) {
      return {
        succeed: false,
        errors: 'You can only update your own profile',
      };
    }

    try {
      if (args.username) profile.setUsername(args.username);
      if (args.bio) profile.bio = args.bio;
      if (args.name) profile.name = args.name;
      if (args.birthDate) profile.setBirthDate(args.birthDate);

      const updatedProfile = await this.profileDataPort.update(id, profile);
      if (!updatedProfile) return { succeed: false };
      return {
        succeed: true,
        response: updatedProfile,
      };
    } catch (e) {
      const error: Error = e as Error;
      return {
        succeed: false,
        errors: error.message,
      };
    }
  }

  @AutheticationUsecases.authorize()
  public async followOrUnfollow(
    sessionId: string,
    profileId: string
  ): Promise<UsecaseResponse<string>> {
    const accountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(
        sessionId
      )
    ).response;
    const accounts = await this.accountDataPort.get({ id: accountId });

    if (accounts.length == 0)
      return {
        succeed: false,
      };

    const profile = accounts[0].profile;

    if (await this.profileDataPort.doesFollow(profile.id, profileId)) {
      await this.profileDataPort.unfollow(profile.id, profileId);
      return {
        succeed: true,
        response: `Unfollowed user with id ${profileId}`,
      };
    } else {
      await this.profileDataPort.follow(profile.id, profileId);
      return {
        succeed: true,
        response: `Followed user with id ${profileId}`,
      };
    }
  }

  @AutheticationUsecases.authorize()
  public async block(
    sessionId: string,
    profileId: string
  ): Promise<UsecaseResponse<void>> {
    const accountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(
        sessionId
      )
    ).response;
    const accounts = await this.accountDataPort.get({ id: accountId });

    if (accounts.length == 0)
      return {
        succeed: false,
      };

    const profile = accounts[0].profile;

    await this.profileDataPort.unfollow(profile.id, profileId);
    await this.profileDataPort.unfollow(profileId, profile.id);

    await this.profileDataPort.block(profile.id, profileId);
    return {
      succeed: true,
    };
  }

  @AutheticationUsecases.authorize()
  public async unblock(
    sessionId: string,
    profileId: string
  ): Promise<UsecaseResponse<void>> {
    const accountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(
        sessionId
      )
    ).response;
    const accounts = await this.accountDataPort.get({ id: accountId });

    if (accounts.length == 0)
      return {
        succeed: false,
      };

    const profile = accounts[0].profile;

    await this.profileDataPort.unblock(profile.id, profileId);
    return {
      succeed: true,
    };
  }
}
