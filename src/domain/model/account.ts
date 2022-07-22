import Profile from './profile';

export default class Account {
  public id!: string;

  constructor(
    public email: string,
    public password: string,
    public profile: Profile
  ) {}
}
