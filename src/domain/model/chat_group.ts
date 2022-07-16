import InvalidToken from '../exceptions/invalid_token';
import Chat from './chat';

export default class ChatGroup extends Chat {
  constructor(
    id: string,
    accountIds: string[],
    public ownerAccountId: string,
    public isPrivate: boolean,
    public token: string = ''
  ) {
    super(id, accountIds);
  }

  public addUser(accountId: string, token: string) {
    if (this.isPrivate && this.token != token) throw new InvalidToken();
    this.accountIds.push(accountId);
    this.accountIds.sort();
  }
}
