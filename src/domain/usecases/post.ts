import Post from '../model/post';
import IPostDataPort, { Query } from '../ports/post_data_port';
import { ICreatePost, IInteractionWithPost } from './interfaces/interface.post';
import { v4 } from 'uuid';

export default class PostUsecases {
  constructor(private readonly postDataPort: IPostDataPort) {}

  public async interactWithPost(
    { accountId, text, sharedPostId }: IInteractionWithPost,
    interactionType: string
  ): Promise<string | null> {
    const createdPostId = await this.createPost({ accountId, text });
    if (createdPostId) {
      if (interactionType == 'SHARE')
        this.postDataPort.sharePost(createdPostId, sharedPostId);
      else this.postDataPort.replyToPost(createdPostId, sharedPostId);
    }
    return null;
  }

  public async createPost({
    accountId,
    text,
  }: ICreatePost): Promise<string | null> {
    try {
      const id = v4();
      const post: Post = new Post(id, accountId, new Date(), text || '');
      const dbId = await this.postDataPort.savePost(post);
      if (dbId == undefined) throw new Error();
      return id;
    } catch (e) {
      const error: Error = e as Error;
      console.log(`[ERROR] Post was not able to be created! ${error.message}`);
      return null;
    }
  }

  public async likePost(id: string, accountId: string) {
    const post = await this.getPostById(id);
    if (post) {
      return this.postDataPort.likePost(post, accountId);
    }
    return 0;
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
