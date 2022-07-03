import Chat, { Message } from '../model/chat';
import Post from '../model/post';

export interface Query {
  accountIds?: string[];
  id?: string;
}

export default interface IChatDataPort {
  saveChat: (chat: Chat) => Promise<string | undefined>;
  addChatMessage: (chat: Chat, message: Message) => Promise<string | undefined>;
  get: (query: Query) => Promise<Chat[]>;
}
