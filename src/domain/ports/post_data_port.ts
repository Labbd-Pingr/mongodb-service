import Post from '../model/post';
import PostWithInteractions from '../model/postWithInteractions';

export interface PostQuery {
  profileId?: string;
  id?: string;
}

export default interface IPostDataPort {
  save: (post: Post) => Promise<Post>;
  likePost: (post: Post, accountId: string) => Promise<number>;
  sharePost: (createdPostId: string, sharedPostId: string) => Promise<number>;
  replyToPost: (createdPostId: string, sharedPostId: string) => Promise<number>;
  delete: (query: PostQuery) => Promise<number>;
  get: (query: PostQuery) => Promise<Post[]>;
  getWithInteractions: (query: PostQuery) => Promise<PostWithInteractions[]>;
}
