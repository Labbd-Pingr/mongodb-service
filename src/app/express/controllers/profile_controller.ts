import { Request, Response, Router } from 'express';
import ProfileDataAdapter from '../../adapters/profile_data_adapter';
import { IUpdateProfile } from '../../../domain/usecases/interfaces/interface.profile';
import { ProfileQuery } from '../../../domain/ports/profile_data_port';
import ProfileUsecases from '../../../domain/usecases/profile';
import Profile from '../../../domain/model/profile';
import { DataSource } from 'typeorm';
import AccountDataAdapter from '../../adapters/account_data_adapter';
import Neo4jRepository from '../../neo4j/neo4j_repository';
import LoginDataAdapter from '../../adapters/login_data_adapater';
import RedisRepository from '../../redis/redis_repository';

export default class ProfileController {
  private readonly _router: Router;
  private profileUsecases: ProfileUsecases;

  constructor(db: DataSource, neo4j: Neo4jRepository, redis: RedisRepository) {
    this._router = Router();
    this.profileUsecases = new ProfileUsecases(
      new ProfileDataAdapter(db, neo4j),
      new AccountDataAdapter(db, neo4j),
      new LoginDataAdapter(redis)
    );
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async getProfileById(req: Request, resp: Response) {
    const profiletId = req.params.id;
    const profile: Profile | null = await this.profileUsecases.getProfileById(
      profiletId
    );
    if (profile != null) resp.json(profile).status(200);
    else resp.sendStatus(404);
  }

  private async getProfileByQuery(req: Request, resp: Response) {
    const query: ProfileQuery = { ...req.query };
    const profiles: Profile[] = await this.profileUsecases.getProfileByQuery(
      query
    );
    resp.json(profiles).status(200);
  }

  private async getProfileByUsernameMatch(req: Request, resp: Response) {
    const username: string = req.query.username as string;
    const profiles = await this.profileUsecases.searchProfilesByUsernameMatch(
      username
    );

    resp.json(profiles).status(200);
  }

  private async updateProfile(req: Request, resp: Response) {
    const profiletId = req.params.id;
    const input: IUpdateProfile = req.body as IUpdateProfile;

    const id = await this.profileUsecases.updateProfile(profiletId, input);
    if (id != null) resp.json(id).status(201);
    else resp.sendStatus(400);
  }

  private async followOrUnfollow(req: Request, resp: Response) {
    const accountId = req.params.id;
    const session = req.body.session;

    const usecaseResp = await this.profileUsecases.followOrUnfollow(
      session,
      accountId
    );
    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private mapRoutes() {
    this._router.get('/', this.getProfileByQuery.bind(this));
    this._router.get('/usernames', this.getProfileByUsernameMatch.bind(this));
    this._router.get('/:id', this.getProfileById.bind(this));
    this._router.patch('/:id', this.updateProfile.bind(this));
    this._router.post('/:id/relationship', this.followOrUnfollow.bind(this));
  }
}
