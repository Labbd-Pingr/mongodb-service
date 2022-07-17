import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import PostDataAdapter from '../../adapters/post_data_adapter';
import PostUsecases from '../../../domain/usecases/post';
import {
  ICreatePost,
  ISharePost,
} from 'src/domain/usecases/interfaces/interface.post';
import Post from 'src/domain/model/post';
import { Query } from 'src/domain/ports/post_data_port';
import Neo4jRepository from 'src/app/neo4j/neo4j_repository';

export default class PostController {
  private readonly _router: Router;
  private postUsecases: PostUsecases;

  constructor(db: Db, neo4j: Neo4jRepository) {
    this._router = Router();
    this.postUsecases = new PostUsecases(new PostDataAdapter(db, neo4j));
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

  private async likePost(req: Request, resp: Response) {
    const postId = req.params.id;
    const userId = 1;
    this.postUsecases.likePost(postId, userId.toString());
    resp.sendStatus(200);
  }

  private async sharePost(req: Request, resp: Response) {
    const id = req.params.id;
    const inputBody: ICreatePost = req.body as ICreatePost;
    const input: ISharePost = {
      profileId: inputBody.profileId,
      text: inputBody.text,
      sharedPostId: id,
    };
    const createdId = this.postUsecases.sharePost(input);
    if (createdId != null) resp.sendStatus(201);
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
    this._router.put('/:id/like', this.likePost.bind(this));
    this._router.put('/:id/share', this.sharePost.bind(this));
  }
}
