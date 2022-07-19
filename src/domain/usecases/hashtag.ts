import Hashtag from '../model/hashtag';
import IHashtagDataPort from '../ports/hashtag_data_port';

export default class HashtagUsecases {
  constructor(private readonly hashtagDataPort: IHashtagDataPort) {}

  public async getHashtagByName(hashtag: string): Promise<Hashtag | null> {
    const hashtags = await this.hashtagDataPort.get({ hashtag });

    if (hashtags.length == 0) {
      console.log(`[ERROR] Could not get hashtag with name ${hashtag}`);
      return null;
    }

    return hashtags[0];
  }

  public async updateOrCreateHashtag(hashtag: string): Promise<Hashtag | null> {
    const hashtags = await this.hashtagDataPort.get({ hashtag });

    if (hashtags.length == 0) {
      const newHashtag = new Hashtag(hashtag, 0, 0);
      return await this.hashtagDataPort.create(newHashtag);
    } else {
      const oldHashtag = hashtags[0];
      oldHashtag.dailyCounter++;
      oldHashtag.globalCounter++;
      return await this.hashtagDataPort.update(oldHashtag);
    }
  }

  public async topHashtags(): Promise<Hashtag[] | null> {
    const hashtags = await this.hashtagDataPort.get({});

    if (hashtags.length == 0) {
      return null;
    }

    return hashtags;
  }
}
