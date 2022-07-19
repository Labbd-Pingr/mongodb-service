import Hashtag from '../../domain/model/hashtag';
import IHashtagDataPort, {
  HashtagQuery,
} from '../../domain/ports/hashtag_data_port';
import { HashtagModel } from '../postgresql/model/hashtag';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

export default class HashtagDataAdapter implements IHashtagDataPort {
  private hashtagRepository: Repository<HashtagModel>;
  constructor(db: DataSource) {
    this.hashtagRepository = db.getRepository('hashtag');
  }

  public async create(profile: Hashtag): Promise<Hashtag> {
    let convertedHashtag = this.convertDomainToApp(profile);
    convertedHashtag = await this.hashtagRepository.save(convertedHashtag);
    return convertedHashtag;
  }

  public async get(query: HashtagQuery): Promise<Hashtag[]> {
    const hashtags: HashtagModel[] = await this.hashtagRepository.findBy(
      query as FindOptionsWhere<Hashtag>
    );

    const mappedHashtags = hashtags.map((hashtag) =>
      this.convertAppToDomain(hashtag)
    );
    mappedHashtags.sort((a, b) => b.dailyCounter - a.dailyCounter);

    return mappedHashtags.slice(0, 10);
  }

  public async update(hashtag: Hashtag): Promise<Hashtag> {
    let convertedHashtag: HashtagModel = this.convertDomainToApp(hashtag);
    convertedHashtag = await this.hashtagRepository.save(convertedHashtag);
    return convertedHashtag;
  }

  private convertDomainToApp(hashtag: Hashtag): HashtagModel {
    const convertedHashtag = new HashtagModel();
    convertedHashtag.hashtag = hashtag.hashtag;
    convertedHashtag.globalCounter = hashtag.globalCounter;
    convertedHashtag.dailyCounter = hashtag.dailyCounter;

    return convertedHashtag;
  }

  private convertAppToDomain(hashtag: HashtagModel): Hashtag {
    const convertedHashtag = new Hashtag(
      hashtag.hashtag,
      hashtag.globalCounter,
      hashtag.dailyCounter
    );

    return convertedHashtag;
  }
}
