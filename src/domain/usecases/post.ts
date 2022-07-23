import Post from '../model/post';
import IPostDataPort, { PostQuery } from '../ports/post_data_port';
import { IInteractionWithPost } from './interfaces/interface.post';
import { v4 } from 'uuid';
import PostWithInteractions from '../model/postWithInteractions';
import HashtagUsecases from './hashtag';
import { UsecaseResponse } from './interfaces/interface';
import AutheticationUsecases from './auth';
import IHashtagDataPort from '../ports/hashtag_data_port';

export default class PostUsecases {
  private readonly hashtagUsecases: HashtagUsecases;
  constructor(
    private readonly postDataPort: IPostDataPort,
    hashtagDataPort: IHashtagDataPort
  ) {
    this.hashtagUsecases = new HashtagUsecases(hashtagDataPort);
  }

  public async interactWithPost(
    { accountId, text, sharedPostId }: IInteractionWithPost,
    interactionType: string
  ): Promise<string | null> {
    // const createdPostId = await this.createPost({ accountId, text });
    // if (createdPostId) {
    //   if (interactionType == 'SHARE')
    //     this.postDataPort.sharePost(createdPostId, sharedPostId);
    //   else this.postDataPort.replyToPost(createdPostId, sharedPostId);
    // }
    return null;
  }

  @AutheticationUsecases.authorize()
  public async createPost(
    session: string,
    text: string
  ): Promise<UsecaseResponse<Post>> {
    try {
      const accountId = await (
        await AutheticationUsecases.sessionUsecases.getAndValidateSession(
          session
        )
      ).response;

      if (!accountId) return { succeed: false };

      const id = v4();
      let post: Post = new Post(id, accountId, new Date(), text || '');
      post = await this.postDataPort.save(post);

      if (post.text)
        post.text.hashtags.forEach((hashtag) =>
          this.hashtagUsecases.updateOrCreateHashtag(hashtag)
        );

      return {
        succeed: true,
        response: post,
      };
    } catch (e) {
      const error: Error = e as Error;
      return {
        succeed: false,
        errors: error.message,
      };
    }
  }

  public async likePost(id: string, accountId: string) {
    const post = await this.getPostById(id);
    if (post) {
      return this.postDataPort.likePost(post, accountId);
    }
    return 0;
  }

  @AutheticationUsecases.authorize()
  public async deletePostById(
    session: string,
    id: string
  ): Promise<UsecaseResponse<void>> {
    const accountId = (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(session)
    ).response;

    const post = await this.getPostById(id);

    if (post?.accountId != accountId) {
      return {
        succeed: false,
        errors: 'You can only delete your own posts!',
      };
    }

    return {
      succeed: await !this.postDataPort.delete({ id }),
    };
  }

  public async getPostById(id: string): Promise<Post | null> {
    const posts = await this.postDataPort.get({ id });
    if (posts.length == 0) {
      console.log(`[ERROR] Could not get post with id ${id}`);
      return null;
    }

    return posts[0];
  }

  public async getPostWithInteractionsById(
    id: string
  ): Promise<UsecaseResponse<PostWithInteractions>> {
    const posts = await this.postDataPort.getWithInteractions({ id });
    if (posts.length == 0) {
      console.log(`[ERROR] Could not get post with id ${id}`);
      return { succeed: false };
    }

    return {
      succeed: true,
      response: posts[0],
    };
  }

  // REMINDER: Esse método deve ser chamado no controler de usuário (exemplo: /profiles/:id/posts)
  public async getPostsByProfileId(profileId: string): Promise<Post[]> {
    const posts = await this.postDataPort.get({ profileId });
    return posts;
  }

  public async getPosts(query: PostQuery): Promise<Post[]> {
    return await this.postDataPort.get(query);
  }
}
