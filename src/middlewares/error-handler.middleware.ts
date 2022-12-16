import type { Request, Response } from 'express'
import type { AppError } from 'lib/utility-classes'

export default (error: AppError, _: Request, response: Response) => {
	const status = error.statusCode || 400
	response.status(status).json({ message: error.message })
}
