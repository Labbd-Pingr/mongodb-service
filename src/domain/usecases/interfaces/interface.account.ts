export interface ICreateAccount {
  email: string;
  password: string;
  username: string;
  name?: string;
  bio?: string;
  birthDate?: Date;
}
