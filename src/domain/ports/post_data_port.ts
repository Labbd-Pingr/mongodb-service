import Post from '../model/post';
import Profile from '../model/profile';

export interface Query {
  profileId?: string;
  id?: string;
}

export default interface IPostDataPort {
  savePost: (post: Post) => Promise<string | undefined>;
  likePost: (post: Post, profile: Profile) => Promise<number>;
  sharePost: (createdPostId: string, sharedPostId: string) => Promise<number>;
  delete: (query: Query) => Promise<number>;
  get: (query: Query) => Promise<Post[]>;
}
