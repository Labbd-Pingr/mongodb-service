import Profile from '../../domain/model/profile';
import IProfileDataPort, {
  ProfileQuery,
} from '../../domain/ports/profile_data_port';
import { ProfileModel } from '../postgresql/model/profile';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

export default class ProfileDataAdapter implements IProfileDataPort {
  private profileRepository: Repository<ProfileModel>;
  constructor(db: DataSource) {
    this.profileRepository = db.getRepository('profile');
  }

  public async create(profile: Profile): Promise<string | undefined> {
    let convertedProfile = this.convertDomainToApp(profile);
    convertedProfile = await this.profileRepository.save(convertedProfile);
    return convertedProfile.id.toString();
  }

  public async get(query: ProfileQuery): Promise<Profile[]> {
    const convertedQuery = {
      ...query,
      ...(query.id && { id: parseInt(query.id) }),
    };

    const profiles: ProfileModel[] = await this.profileRepository.findBy(
      convertedQuery as FindOptionsWhere<Profile>
    );

    return profiles.map((profile) => this.convertAppToDomain(profile));
  }

  public async getByUsernameMatch(username: string): Promise<Profile[]> {
    const profiles: ProfileModel[] = await this.profileRepository.query(
      `SELECT * FROM profile WHERE username LIKE '${username}%'`
    );

    return profiles.map((profile) => this.convertAppToDomain(profile));
  }

  public async update(
    id: string,
    profile: Profile
  ): Promise<string | undefined> {
    let convertedProfile: ProfileModel = this.convertDomainToApp(profile);
    convertedProfile.id = parseInt(id);
    convertedProfile = await this.profileRepository.save(convertedProfile);
    return convertedProfile.id.toString();
  }

  private convertDomainToApp(profile: Profile): ProfileModel {
    const convertedProfile = new ProfileModel();
    convertedProfile.username = profile.username;
    convertedProfile.name = profile.name;
    convertedProfile.bio = profile.bio;
    if (profile.birthDate) convertedProfile.birthDate = profile.birthDate;
    return convertedProfile;
  }

  private convertAppToDomain(profile: ProfileModel): Profile {
    const convertedProfile = new Profile(
      profile.username,
      profile.name,
      profile.bio,
      profile.birthDate
    );

    return convertedProfile;
  }
}
