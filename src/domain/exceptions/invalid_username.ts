export default class InvalidUsernameError extends Error {
  constructor(username: string) {
    super(`Invalid username! Every username must start with '@'. ${username}`);
  }
}
