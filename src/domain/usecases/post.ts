import Post from '../model/post';
import IPostDataPort from '../ports/post_data_port';
import { ICreatePost } from './interface.post';

export default class PostUsecases {
  constructor(private readonly postDataPort: IPostDataPort) {}

  public async createPost({ profile_id, text }: ICreatePost) {
    try {
      const post: Post = new Post(profile_id, new Date(), text || '');
      const postId = await this.postDataPort.save(post);
      if (postId == undefined) throw new Error();
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] Post was not able to be created! ${error.message}`);
    }
  }

  public async getPosts() {
    return this.postDataPort.getAll();
  }
}
