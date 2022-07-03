import Post from '../model/post';

export interface Query {
  profileId?: string;
  id?: string;
}

export default interface IPostDataPort {
  savePost: (post: Post) => Promise<string | undefined>;
  delete: (query: Query) => Promise<number>;
  get: (query: Query) => Promise<Post[]>;
}
