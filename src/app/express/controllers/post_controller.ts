import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import PostUsecases from '../../../domain/usecases/post';
import { IInteractionWithPost } from '../../../domain/usecases/interfaces/interface.post';
import Post from '../../../domain/model/post';
import { PostQuery } from '../../../domain/ports/post_data_port';
import PostWithInteractions from '../../../domain/model/postWithInteractions';
import Neo4jRepository from '../../neo4j/neo4j_repository';
import PostDataAdapter from '../../adapters/post_data_adapter';
import { DataSource } from 'typeorm';
import HashtagDataAdapter from '../../adapters/hashtag_data_adapter';

export default class PostController {
  private readonly _router: Router;
  private postUsecases: PostUsecases;

  constructor(mongo: Db, neo4j: Neo4jRepository, postgres: DataSource) {
    this._router = Router();
    this.postUsecases = new PostUsecases(
      new PostDataAdapter(mongo, neo4j),
      new HashtagDataAdapter(postgres)
    );
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async getPosts(req: Request, resp: Response) {
    const query: PostQuery = { ...req.query };
    const posts: Post[] = await this.postUsecases.getPosts(query);
    resp.status(200).json(posts);
  }

  private async getPostById(req: Request, resp: Response) {
    const postId = req.params.id;
    const usecaseResp = await this.postUsecases.getPostWithInteractionsById(
      postId
    );
    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.sendStatus(404);
  }

  private async createPost(req: Request, resp: Response) {
    const session = req.body.session;
    const text = req.body.text;
    const usecaseResp = await this.postUsecases.createPost(session, text);
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async likePost(req: Request, resp: Response) {
    const postId = req.params.id;
    const session = req.body.session;
    const usecaseResp = await this.postUsecases.likePost(session, postId);
    if (usecaseResp.succeed) resp.sendStatus(200);
    else if (!usecaseResp.errors) resp.sendStatus(500);
    else resp.status(401).json(usecaseResp.errors);
  }

  private async sharePost(req: Request, resp: Response) {
    const id = req.params.id;
    const session = req.body.session;
    const text = req.body.text;

    const usecaseResp = await this.postUsecases.interactWithPost(
      session,
      {
        text,
        sharedPostId: id,
      } as IInteractionWithPost,
      'SHARE'
    );
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else if (!usecaseResp.errors) resp.sendStatus(500);
    else resp.status(401).json(usecaseResp.errors);
  }

  private async replyToPost(req: Request, resp: Response) {
    const id = req.params.id;
    const session = req.body.session;
    const text = req.body.text;

    const usecaseResp = await this.postUsecases.interactWithPost(
      session,
      {
        text,
        sharedPostId: id,
      } as IInteractionWithPost,
      'REPLY'
    );
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else if (!usecaseResp.errors) resp.sendStatus(500);
    else resp.status(401).json(usecaseResp.errors);
  }

  private async deletePostById(req: Request, resp: Response) {
    const postId = req.params.id;
    const session = req.body.session;
    const usecaseResp = await this.postUsecases.deletePostById(session, postId);
    if (usecaseResp.succeed) resp.sendStatus(200);
    else if (!usecaseResp.errors) resp.sendStatus(500);
    else resp.status(401).json(usecaseResp.errors);
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
