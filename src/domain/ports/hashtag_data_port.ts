import Hashtag from '../model/hashtag';

export interface HashtagQuery {
  hashtag?: string;
}

export default interface IHashtagDataPort {
  create: (hashtag: Hashtag) => Promise<Hashtag>;
  get: (query: HashtagQuery) => Promise<Hashtag[]>;
  update: (hashtag: Hashtag) => Promise<Hashtag>;
}
