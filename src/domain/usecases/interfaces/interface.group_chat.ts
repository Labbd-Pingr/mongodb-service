export interface ICreateGroupChat {
  accountIds: string[];
  ownerAccountId: string;
  isPrivate: boolean;
}

export interface IAddUser {
  accountId: string;
  chatToken: string;
}
