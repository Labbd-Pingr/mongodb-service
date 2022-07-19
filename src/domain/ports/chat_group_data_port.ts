import { Message } from '../model/chat';
import ChatGroup from '../model/chat_group';
import { Query } from './chat_data_port';

export interface ChatGroupQuery extends Query {
  ownerAccountId?: string;
  isPrivate?: boolean;
  token?: string;
}

export default interface IChatGroupDataPort {
  addGroupUser: (chat: ChatGroup, id: string) => Promise<string | undefined>;
  saveChat: (chat: ChatGroup) => Promise<string | undefined>;
  addChatMessage: (
    chat: ChatGroup,
    message: Message
  ) => Promise<string | undefined>;
  get: (query: ChatGroupQuery) => Promise<ChatGroup[]>;
}
