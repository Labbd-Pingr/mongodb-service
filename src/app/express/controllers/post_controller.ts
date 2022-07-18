import { Router, Request, Response, response } from 'express';
import PostUsecases from '../../../domain/usecases/post';
import {
  ICreatePost,
  IInteractionWithPost,
} from 'src/domain/usecases/interfaces/interface.post';
import Post from 'src/domain/model/post';
import { Query } from 'src/domain/ports/post_data_port';
import SessionUsecases from 'src/domain/usecases/session';

export default class PostController {
  private readonly _router: Router;
  private postUsecases: PostUsecases;
  private sessionUsecases: SessionUsecases;

  constructor(postUsecases: PostUsecases, sessionUsecases: SessionUsecases) {
    this._router = Router();
    this.postUsecases = postUsecases;
    this.sessionUsecases = sessionUsecases;
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async getPosts(req: Request, resp: Response) {
    const query: Query = { ...req.query };
    const posts: Post[] = await this.postUsecases.getPosts(query);
    resp.status(200).json(posts);
  }

  private async getPostById(req: Request, resp: Response) {
    const postId = req.params.id;
    const post: Post | null = await this.postUsecases.getPostById(postId);
    if (post != null) resp.status(200).json(post);
    else resp.sendStatus(404);
  }

  private async createPost(req: Request, resp: Response) {
    const input: ICreatePost = req.body as ICreatePost;
    // const sessionId = req.headers['sessionId']
    //   ? req.headers['sessionId'].toString()
    //   : '';
    // this.validateSession(sessionId);
    const id = await this.postUsecases.createPost(input);
    if (id != null) resp.status(201).json(id);
    else resp.sendStatus(400);
  }

  private async likePost(req: Request, resp: Response) {
    const postId = req.params.id;
    const accountId = req.body['accountId'];
    this.postUsecases.likePost(postId, accountId);
    resp.sendStatus(200);
  }

  private async sharePost(req: Request, resp: Response) {
    const id = req.params.id;
    const inputBody: ICreatePost = req.body as ICreatePost;
    const input: IInteractionWithPost = {
      accountId: inputBody.accountId,
      text: inputBody.text,
      sharedPostId: id,
    };
    const createdId = this.postUsecases.interactWithPost(input, 'SHARE');
    if (createdId != null) resp.sendStatus(201);
    else resp.sendStatus(400);
  }

  private async replyToPost(req: Request, resp: Response) {
    const id = req.params.id;
    const inputBody: ICreatePost = req.body as ICreatePost;
    const input: IInteractionWithPost = {
      accountId: inputBody.accountId,
      text: inputBody.text,
      sharedPostId: id,
    };
    const createdId = this.postUsecases.interactWithPost(input, 'REPLY');
    if (createdId != null) resp.sendStatus(201);
    else resp.sendStatus(400);
  }

  private async deletePostById(req: Request, resp: Response) {
    const postId = req.params.id;
    this.postUsecases.deletePostById(postId);
    resp.sendStatus(200);
  }

  private async validateSession(sessionId: string): Promise<any> {
    const result = await this.sessionUsecases.getAndValidateSession(sessionId);
    if (result.succeed) {
      return;
    }

    return response.sendStatus(401);
  }

  private mapRoutes() {
    this._router.post('/', this.createPost.bind(this));
    this._router.get('/', this.getPosts.bind(this));
    this._router.get('/:id', this.getPostById.bind(this));
    this._router.delete('/:id', this.deletePostById.bind(this));
    this._router.put('/:id/like', this.likePost.bind(this));
    this._router.put('/:id/share', this.sharePost.bind(this));
    this._router.put('/:id/reply', this.replyToPost.bind(this));
  }
}
