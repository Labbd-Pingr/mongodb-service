export default class FutureDateError extends Error {
  constructor(date: Date) {
    super(`Invalid date! It must be a non-future date. ${date}`);
  }
}
