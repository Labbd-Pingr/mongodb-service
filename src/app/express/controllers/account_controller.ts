import { Request, Response, Router } from 'express';
import { DataSource } from 'typeorm';
import AccountDataAdapter from '../../adapters/account_data_adapter';
import AccountUsecases from '../../../domain/usecases/account';
import RedisRepository from '../../redis/redis_repository';
import Neo4jRepository from '../../neo4j/neo4j_repository';
import ProfileDataAdapter from '../../adapters/profile_data_adapter';
import { ICreateAccount } from 'src/domain/usecases/interface.account';
import Account from '../../../domain/model/account';

export default class AccountController {
  private readonly _router: Router;
  private accountUsecases: AccountUsecases;

  constructor(
    postgres: DataSource,
    neo4j: Neo4jRepository,
    redis: RedisRepository
  ) {
    this._router = Router();
    this.accountUsecases = new AccountUsecases(
      new AccountDataAdapter(postgres, neo4j, redis),
      new ProfileDataAdapter(postgres)
    );
    this.mapRoutes();
  }

  public get router(): Router {
    return this._router;
  }

  private async createAccount(req: Request, resp: Response) {
    const input: ICreateAccount = req.body as ICreateAccount;
    const usecaseResp = await this.accountUsecases.createAccount(input);
    if (usecaseResp.succeed) resp.status(201).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private async getAccountById(req: Request, resp: Response) {
    const accountId = req.params.id;
    const usecaseResp = await this.accountUsecases.getAccountById(accountId);
    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.sendStatus(404);
  }

  private async isAccountLogged(req: Request, resp: Response) {
    const accountId = req.params.id;
    const usecaseResp = await this.accountUsecases.isAccountLogged(accountId);
    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.sendStatus(500);
  }

  private async loginAccount(req: Request, resp: Response) {
    const accountId = req.params.id;
    const password = req.body.password;
    console.log('SENHA:' + password);
    const usecaseResp = await this.accountUsecases.loginAccount(
      accountId,
      password
    );

    if (usecaseResp.succeed) resp.status(200).json(usecaseResp.response);
    else resp.status(400).json(usecaseResp.errors);
  }

  private mapRoutes() {
    this._router.post('/', this.createAccount.bind(this));
    this._router.get('/:id', this.getAccountById.bind(this));
    this._router.get('/:id/auth', this.isAccountLogged.bind(this));
    this._router.post('/:id/auth', this.loginAccount.bind(this));
  }
}
