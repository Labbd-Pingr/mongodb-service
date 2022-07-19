import InvalidToken from '../exceptions/invalid_token';
import Chat, { Message } from './chat';

export default class ChatGroup extends Chat {
  constructor(
    id: string,
    accountIds: string[],
    messages: Message[],
    public ownerAccountId: string,
    public isPrivate: boolean,
    public token: string = ''
  ) {
    super(id, accountIds, messages);
  }

  public addUser(accountId: string, token: string) {
    if (this.isPrivate && this.token != token) throw new InvalidToken();
    this.accountIds.push(accountId);
    this.accountIds.sort();
  }
}
