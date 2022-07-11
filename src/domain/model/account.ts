import Profile from './profile';

export default class Account {
  constructor(
    public email: string,
    public password: string,
    public profile: Profile
  ) {}
}
