import Post from '../model/post';
import IPostDataPort, { Query } from '../ports/post_data_port';
import { ICreatePost, ISharePost } from './interface.post';
import { v4 } from 'uuid';
import Profile from '../model/profile';

export default class PostUsecases {
  constructor(private readonly postDataPort: IPostDataPort) {}

  public async sharePost({
    profileId,
    text,
    sharedPostId,
  }: ISharePost): Promise<string | null> {
    const createdPostId = await this.createPost({ profileId, text });
    if (createdPostId) {
      this.postDataPort.sharePost(createdPostId, sharedPostId);
    }
    return null;
  }

  public async createPost({
    profileId,
    text,
  }: ICreatePost): Promise<string | null> {
    try {
      const id = v4();
      const post: Post = new Post(id, profileId, new Date(), text || '');
      const dbId = await this.postDataPort.savePost(post);
      if (dbId == undefined) throw new Error();
      return id;
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] Post was not able to be created! ${error.message}`);
      return null;
    }
  }

  public async likePost(id: string, profileId: string) {
    const post = await this.getPostById(id);
    // Procurar por usuário
    const profile = new Profile("Alfredo Goldman");

    if (post) {
      return this.postDataPort.likePost(post, profile);
    }

    return 0
  }

  public async deletePostById(id: string) {
    if (await !this.postDataPort.delete({ id }))
      console.log(`[ERROR] Could not delete post with id ${id}`);
  }

  public async getPostById(id: string): Promise<Post | null> {
    const posts = await this.postDataPort.get({ id });
    if (posts.length == 0) {
      console.log(`[ERROR] Could not get post with id ${id}`);
      return null;
    }

    return posts[0];
  }

  // REMINDER: Esse método deve ser chamado no controler de usuário (exemplo: /profiles/:id/posts)
  public async getPostsByProfileId(profileId: string): Promise<Post[]> {
    const posts = await this.postDataPort.get({ profileId });
    return posts;
  }

  public async getPosts(query: Query): Promise<Post[]> {
    return await this.postDataPort.get(query);
  }
}
