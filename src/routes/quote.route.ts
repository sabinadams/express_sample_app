import * as QuoteController from 'controllers/quote.controller'
import { Router } from 'express'
import validate from 'middlewares/validate.middleware'
import {
  CreateQuoteSchema,
  DeleteQuoteSchema
} from 'validation/request.schemas'

const router = Router()

router.get('/', QuoteController.getAllQuotes)
router.post('/', validate(CreateQuoteSchema), QuoteController.createQuote)
router.delete('/:id', validate(DeleteQuoteSchema), QuoteController.deleteQuote)

export default router
