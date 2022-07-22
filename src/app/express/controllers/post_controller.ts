import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import PostUsecases from '../../../domain/usecases/post';
import {
  ICreatePost,
  IInteractionWithPost,
} from '../../../domain/usecases/interfaces/interface.post';
import Post from '../../../domain/model/post';
import { Query } from '../../../domain/ports/post_data_port';
import PostWithInteractions from '../../../domain/model/postWithInteractions';
import Neo4jRepository from '../../neo4j/neo4j_repository';
import PostDataAdapter from '../../adapters/post_data_adapter';
import HashtagUsecases from '../../../domain/usecases/hashtag';

export default class PostController {
  private readonly _router: Router;
  private postUsecases: PostUsecases;

  constructor(
    mongo: Db,
    neo4j: Neo4jRepository,
    private hashtagUsecases: HashtagUsecases
  ) {
    this._router = Router();
    this.postUsecases = new PostUsecases(
      new PostDataAdapter(mongo, neo4j),
      hashtagUsecases
    );
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
    const post: PostWithInteractions | null =
      await this.postUsecases.getPostWithInteractionsById(postId);
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
