import { validateJWT } from 'auth/auth.service'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import type { AnyZodObject } from 'zod'
import { ZodError } from 'zod'

export const authorization = (
  request: Request<unknown>,
  response: Response,
  next: NextFunction
) => {
  if (request.method === 'OPTIONS')
    return response.send({ message: 'Preflight check successful.' })

  if (!request.headers.authorization) {
    return next(
      new AppError('unauthorized', '`Authorization` header is required.')
    )
  }

  if (!request.headers.authorization.startsWith('Bearer ')) {
    return next(new AppError('unauthorized', 'Invalid access token.'))
  }

  const token = request.headers.authorization.split(' ')[1].trim()

  if (!token) {
    return next(new AppError('unauthorized', 'Invalid access token.'))
  }

  try {
    request['session'] = { userId: validateJWT(token) }
    next()
  } catch (e) {
    return next(new AppError('validation', 'Invalid access token.'))
  }
}

export const errorHandler = (
  error: Error,
  _: Request,
  response: Response,
  _next: NextFunction // eslint-disable-line no-unused-vars
) => {
  response
    .status('statusCode' in error ? (error.statusCode as number) : 500)
    .json({
      message:
        error instanceof AppError
          ? error.message
          : 'Oops! Something wonky happened...'
    })
}

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request<unknown>, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const invalids = error.issues.map(issue => issue.path.pop())
        next(
          new AppError(
            'validation',
            `Invalid or missing input${
              invalids.length > 1 ? 's' : ''
            } provided for: ${invalids.join(', ')}`
          )
        )
      } else {
        next(new AppError('validation', 'Invalid input'))
      }
    }
  }
