import { Router } from 'express'
const router = Router()
import * as QuoteController from 'controllers/quote.controller'
import authorizationMiddleware from 'middlewares/authorization.middleware'
import validate from 'middlewares/validate.middleware'
import { CreateQuoteSchema, DeleteQuoteSchema } from 'validation/request.schemas'

router.get('/', authorizationMiddleware, QuoteController.getAllQuotes)
router.post('/', authorizationMiddleware, validate(CreateQuoteSchema), QuoteController.createQuote)
router.delete('/:id', authorizationMiddleware, validate(DeleteQuoteSchema), QuoteController.deleteQuote)

export default router