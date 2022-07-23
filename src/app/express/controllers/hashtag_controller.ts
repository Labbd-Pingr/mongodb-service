import HashtagUsecases from '../../../domain/usecases/hashtag';
import { DataSource } from 'typeorm';
import { Router, Request, Response } from 'express';
import HashtagDataAdapter from '../../adapters/hashtag_data_adapter';

export default class HashtagController {
  private readonly _router: Router;
  public hashtagUsecases: HashtagUsecases;

  constructor(db: DataSource) {
    this._router = Router();
    this.hashtagUsecases = new HashtagUsecases(new HashtagDataAdapter(db));
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async getHashtags(req: Request, resp: Response) {
    const hashtags = await this.hashtagUsecases.topHashtags();

    if (hashtags != null) resp.json(hashtags).status(200);
    else resp.sendStatus(404);
  }

  private async updateHashtags(req: Request, resp: Response) {
    const hashtags = await this.hashtagUsecases.updateGlobalCounter();

    if (hashtags != null) resp.json(hashtags).status(200);
    else resp.sendStatus(404);
  }

  private mapRoutes() {
    this._router.get('/', this.getHashtags.bind(this));
    this._router.get('/update', this.updateHashtags.bind(this));
  }
}
