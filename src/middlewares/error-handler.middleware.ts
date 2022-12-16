import { Request, Response, NextFunction } from "express";
import { AppError } from "lib/utility-classes";


export default (
  error: AppError, 
  request: Request, 
  response: Response, 
  next: NextFunction
) => {
  const status = error.statusCode || 400
  response.status(status).json({ message: error.message })
}