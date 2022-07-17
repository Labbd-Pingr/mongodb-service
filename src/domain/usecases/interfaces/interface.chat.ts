export interface ICreateChat {
  accountIds: string[];
}

export interface ISendMessage {
  senderId: string;
  text: string;
}
