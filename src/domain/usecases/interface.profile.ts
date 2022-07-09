export interface ICreateProfile {
  username: string;
  name?: string;
  bio?: string;
  birthDate?: Date;
}

export interface IUpdateProfile {
  username?: string;
  name?: string;
  bio?: string;
  birthDate?: Date;
}
