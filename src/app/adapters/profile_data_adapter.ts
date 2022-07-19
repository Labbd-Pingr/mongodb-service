import Profile from '../../domain/model/profile';
import IProfileDataPort, {
  ProfileQuery,
} from '../../domain/ports/profile_data_port';
import { ProfileModel } from '../postgresql/model/profile';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import Neo4jRepository from '../neo4j/neo4j_repository';

export default class ProfileDataAdapter implements IProfileDataPort {
  private readonly profileRepository: Repository<ProfileModel>;
  private readonly neo4jRepository: Neo4jRepository;

  constructor(db: DataSource, neo4j: Neo4jRepository) {
    this.profileRepository = db.getRepository('profile');
    this.neo4jRepository = neo4j;
  }

  public async create(profile: Profile): Promise<string> {
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
      convertedQuery as FindOptionsWhere<ProfileModel>
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

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.profileRepository.delete(parseInt(id));
    return result.affected == 1;
  }

  public async doesFollow(
    profileId1: string,
    profileId2: string
  ): Promise<boolean> {
    const result = await this.neo4jRepository.runCommand(
      'MATCH (u1:user) - [rel:FOLLOW] -> (u2:user) \
      WHERE u1.profileId = $profileId1 AND u2.profileId = $profileId2 \
      return rel',
      { profileId1, profileId2 }
    );

    return result.records.length != 0;
  }

  public async follow(profileId1: string, profileId2: string): Promise<void> {
    await this.neo4jRepository.runCommand(
      'MATCH (u1:user), (u2:user) \
      WHERE u1.profileId = $profileId1 AND u2.profileId = $profileId2 \
      CREATE (u1) - [:FOLLOW] -> (u2)',
      { profileId1, profileId2 }
    );
  }

  public async unfollow(profileId1: string, profileId2: string): Promise<void> {
    await this.neo4jRepository.runCommand(
      'MATCH (u1:user) - [rel:FOLLOW] -> (u2:user) \
      WHERE u1.profileId = $profileId1 AND u2.profileId = $profileId2 \
      DELETE rel',
      { profileId1, profileId2 }
    );
  }

  public async block(profileId1: string, profileId2: string): Promise<void> {
    await this.neo4jRepository.runCommand(
      'MATCH (u1:user), (u2:user) \
      WHERE u1.profileId = $profileId1 AND u2.profileId = $profileId2 \
      CREATE (u1) - [:BLOCK] -> (u2)',
      { profileId1, profileId2 }
    );
  }

  public async unblock(profileId1: string, profileId2: string): Promise<void> {
    await this.neo4jRepository.runCommand(
      'MATCH (u1:user) - [rel:BLOCK] -> (u2:user) \
      WHERE u1.profileId = $profileId1 AND u2.profileId = $profileId2 \
      DELETE rel',
      { profileId1, profileId2 }
    );
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
