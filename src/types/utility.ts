import { Request } from 'express';

/**
 * Allows you to provide a type for the request body
 */
export interface TypedRequestBody<T> extends Request {
  body: T
}