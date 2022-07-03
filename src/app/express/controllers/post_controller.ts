import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import PostDataAdapter from '../../adapters/post_data_adapter';
import PostUsecases from '../../../domain/usecases/post';
import { ICreatePost } from 'src/domain/usecases/interface.post';
import Post from 'src/domain/model/post';
import { Query } from 'src/domain/ports/post_data_port';

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
    const id = await this.postUsecases.createPost(input);
    if (id != null) resp.status(201).json(id);
    else resp.sendStatus(400);
  }

  private async deletePostById(req: Request, resp: Response) {
    const postId = req.params.id;
    this.postUsecases.deletePostById(postId);
    resp.sendStatus(200);
  }

  private mapRoutes() {
    this._router.post('/', this.createPost.bind(this));
    this._router.get('/', this.getPosts.bind(this));
    this._router.get('/:id', this.getPostById.bind(this));
    this._router.delete('/:id', this.deletePostById.bind(this));
  }
}