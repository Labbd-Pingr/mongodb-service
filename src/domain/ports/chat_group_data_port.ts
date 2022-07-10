import ChatGroup from '../model/chat_group';
import IChatDataPort, { Query } from './chat_data_port';

export interface ChatGroupQuery extends Query {
  ownerAccountId?: string;
  isPrivate?: boolean;
  token?: string;
}

export default interface IChatGroupDataPort extends IChatDataPort {
  get: (query: ChatGroupQuery) => Promise<ChatGroup[]>;
  addGroupUser: (chat: ChatGroup, id: string) => Promise<ChatGroup>;
}
