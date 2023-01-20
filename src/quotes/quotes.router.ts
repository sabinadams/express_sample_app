import * as QuoteController from './quotes.controller'
import { CreateQuoteSchema, DeleteQuoteSchema } from './quotes.schemas'
import { Router } from 'express'
import { validate } from 'lib/middlewares'

const router = Router()

router.get('/', QuoteController.getAllQuotes)
router.post('/', validate(CreateQuoteSchema), QuoteController.createQuote)
router.delete('/:id', validate(DeleteQuoteSchema), QuoteController.deleteQuote)

export default router
