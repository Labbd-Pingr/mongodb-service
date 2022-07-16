export interface ICreatePost {
  profileId: string;
  text: string;
}

export interface ISharePost {
  profileId: string;
  text: string;
  sharedPostId: string
}
