import NotAllowedError from '../exceptions/not_allowed';

export class Message {
  constructor(
    public readonly senderId: string,
    public readonly date: Date,
    public readonly text: string
  ) {}
}

export default class Chat {
  public readonly messages: Message[];
  constructor(public readonly id: string, public accountIds: string[]) {
    this.accountIds.sort();
    this.messages = [];
  }

  public sendMessage(senderId: string, text: string): Message {
    if (!this.accountIds.includes(senderId))
      throw new NotAllowedError(senderId);

    const message = new Message(senderId, new Date(), text);
    this.messages.push(message);
    return message;
  }
}
