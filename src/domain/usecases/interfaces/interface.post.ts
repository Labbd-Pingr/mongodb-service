export interface ICreatePost {
  accountId: string;
  text: string;
}

export interface ISharePost {
  accountId: string;
  text: string;
  sharedPostId: string;
}
