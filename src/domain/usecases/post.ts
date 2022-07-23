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

  @AutheticationUsecases.authorize()
  public async interactWithPost(
    session: string,
    { text, sharedPostId }: IInteractionWithPost,
    interactionType: string
  ): Promise<UsecaseResponse<Post>> {
    const createdPostResponse = await this.createPost(session, text);

    if (!createdPostResponse.response || !createdPostResponse.succeed)
      return createdPostResponse;

    const post: Post = createdPostResponse.response;
    if (interactionType == 'SHARE')
      this.postDataPort.sharePost(post.id, sharedPostId);
    else if (interactionType == 'REPLY')
      this.postDataPort.replyToPost(post.id, sharedPostId);
    return createdPostResponse;
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

  @AutheticationUsecases.authorize()
  public async likePost(
    session: string,
    id: string
  ): Promise<UsecaseResponse<void>> {
    const accountId = await (
      await AutheticationUsecases.sessionUsecases.getAndValidateSession(session)
    ).response;

    if (!accountId) return { succeed: false };
    const post = await this.getPostById(id);
    if (!post)
      return {
        succeed: false,
      };
    return {
      succeed: (await this.postDataPort.likePost(post, accountId)) != 0,
    };
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

  public async getPostsByAccountId(
    accountId: string
  ): Promise<UsecaseResponse<Post[]>> {
    const posts = await this.postDataPort.get({ accountId });
    return {
      succeed: true,
      response: posts,
    };
  }

  public async getPosts(query: PostQuery): Promise<Post[]> {
    return await this.postDataPort.get(query);
  }
}
