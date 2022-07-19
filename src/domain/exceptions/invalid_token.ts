export default class InvalidToken extends Error {
  constructor() {
    super(`The Token is invalid.`);
  }
}
