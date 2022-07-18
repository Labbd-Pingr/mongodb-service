export interface ICreatePost {
  accountId: string;
  text: string;
}

export interface IInteractionWithPost {
  accountId: string;
  text: string;
  sharedPostId: string;
}
