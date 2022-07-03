import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import PostDataAdapter from '../../adapters/post_data_adapter';
import PostUsecases from '../../../domain/usecases/post';
import { ICreatePost } from 'src/domain/usecases/interface.post';
import Post from 'src/domain/model/post';

export default class PostController {
  private readonly _router: Router;
  private postUsecases: PostUsecases;

  constructor(db: Db) {
    this._router = Router();
    this.postUsecases = new PostUsecases(new PostDataAdapter(db));
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async getAllPosts(req: Request, resp: Response) {
    const posts: Post[] = await this.postUsecases.getPosts();
    resp.json(posts).status(200);
  }

  private async createPost(req: Request, resp: Response) {
    const input: ICreatePost = req.body as ICreatePost;
    this.postUsecases.createPost(input);
    resp.status(201);
    return resp;
  }

  private mapRoutes() {
    this._router.get('/', this.getAllPosts.bind(this));
    this._router.put('/', this.createPost.bind(this));
  }
}
