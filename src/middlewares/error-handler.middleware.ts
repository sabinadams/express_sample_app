import type { Request, Response } from 'express'

export default (error: Error, _: Request, response: Response) => {
  response
    .status('statusCode' in error ? (error.statusCode as number) : 400)
    .json({ message: error.message })
}
