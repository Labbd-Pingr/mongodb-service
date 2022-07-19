import { Repository } from 'redis-om';
import ILoginDataPort from '../../domain/ports/login_data_port';
import { AccountModel } from '../redis/model/account';
import RedisRepository from '../redis/redis_repository';

const SESSION_LIFETIME_IN_DAYS = 1;

export default class LoginDataAdapter implements ILoginDataPort {
  private readonly sessionRepository: Repository<AccountModel>;

  constructor(redis: RedisRepository) {
    this.sessionRepository = redis.getSessionRepository();
  }

  public async doesAccountHaveAValidSession(
    accountId: string
  ): Promise<boolean> {
    const sessions = await this.sessionRepository
      .search()
      .where('accountId')
      .equals(accountId)
      .returnAll();

    if (sessions.length == 0) return false;
    return sessions.some((session) => session.expirationDate > Date.now());
  }

  public async isAValidSession(sessionId: string): Promise<boolean> {
    const session = await this.sessionRepository.fetch(sessionId);
    return (
      session.expirationDate != null && session.expirationDate > Date.now()
    );
  }

  public async getAccountBySession(sessionId: string): Promise<string> {
    const session = await this.sessionRepository.fetch(sessionId);
    return session.accountId;
  }

  public async logIn(accountId: string): Promise<string> {
    const session = await this.sessionRepository.createAndSave({
      accountId,
      expirationDate: Date.now() + SESSION_LIFETIME_IN_DAYS,
    });

    return session.entityId;
  }

  public async logout(sessionId: string): Promise<void> {
    await this.sessionRepository.remove(sessionId);
  }
}
