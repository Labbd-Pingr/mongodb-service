import FutureDateError from '../exceptions/future_date';
import InvalidUsernameError from '../exceptions/invalid_username';

export default class Profile {
  public id!: string;

  constructor(
    public username: string,
    public name: string = username,
    public bio: string = '',
    public birthDate: Date | null = null
  ) {
    if (username.match(/^@/) == null) {
      throw new InvalidUsernameError(username);
    }

    if (birthDate != null && birthDate.getTime() <= Date.now())
      throw new FutureDateError(birthDate);
  }
}
