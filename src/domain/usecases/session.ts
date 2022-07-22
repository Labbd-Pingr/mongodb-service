import ILoginDataPort from '../ports/login_data_port';
import AutheticationUsecases from './auth';
import { UsecaseResponse } from './interfaces/interface';

export default class SessionUsecases {
  constructor(private readonly loginDataPort: ILoginDataPort) {}

  public async DoesAccountHaveAValidSession(
    accountId: string
  ): Promise<UsecaseResponse<boolean>> {
    try {
      return {
        succeed: true,
        response: await this.loginDataPort.doesAccountHaveAValidSession(
          accountId
        ),
      };
    } catch (e) {
      const error: Error = e as Error;
      console.log(
        `[ERROR] Could not check if account is logged in! ${error.message}`
      );
      return {
        succeed: false,
        errors: error.message,
      };
    }
  }

  public async getAndValidateSession(
    sessionId: string
  ): Promise<UsecaseResponse<string>> {
    if (!(await this.loginDataPort.isAValidSession(sessionId)))
      return {
        succeed: false,
        errors: `Session id ${sessionId} is invalid!`,
      };

    return {
      succeed: true,
      response: await this.loginDataPort.getAccountBySession(sessionId),
    };
  }

  @AutheticationUsecases.authorize()
  public async deleteSession(session: string): Promise<UsecaseResponse<void>> {
    await this.loginDataPort.logout(session);
    return {
      succeed: true,
    };
  }
}
