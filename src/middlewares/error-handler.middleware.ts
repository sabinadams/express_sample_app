import { Request, Response, NextFunction } from "express";
import { AppError } from "lib/utility-classes";


export default (
  error: AppError, 
  request: Request, 
  response: Response, 
  next: NextFunction) => {
      response.header("Content-Type", 'application/json')
      const status = error.statusCode || 400
      response.status(status).send({ message: error.message })
}