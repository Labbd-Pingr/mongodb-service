export interface UsecaseResponse<T> {
  succeed: boolean;
  response?: T;
  errors?: string;
}
