export interface ICreateAccount {
  email: string;
  password: string;
  username: string;
  name?: string;
  bio?: string;
  birthDate?: Date;
}

export interface UsecaseResponse<T> {
  succeed: boolean;
  response?: T;
  errors?: string;
}
