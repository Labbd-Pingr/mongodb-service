import { Request, Response, Router } from 'express';
import LoginDataAdapter from '../../adapters/login_data_adapater';
import SessionUsecases from '../../../domain/usecases/session';
import RedisRepository from '../../redis/redis_repository';

export default class AuthController {
  private readonly _router: Router;
  private sessionUsecases: SessionUsecases;

  constructor(redis: RedisRepository) {
    this._router = Router();
    this.sessionUsecases = new SessionUsecases(new LoginDataAdapter(redis));
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async getAndValidateSession(req: Request, resp: Response) {
    const sessionId = req.params.id;
    const usecaseResp = await this.sessionUsecases.getAndValidateSession(
      sessionId
    );
    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private mapRoutes() {
    this._router.get('/:id', this.getAndValidateSession.bind(this));
  }
}
