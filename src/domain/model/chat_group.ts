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

  public addUser(userId: string) {
    this.accountIds.push(userId);
    this.accountIds.sort();
  }
}
