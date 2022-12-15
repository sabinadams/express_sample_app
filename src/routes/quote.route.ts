import { Router } from "express";
const router = Router()
import * as QuoteController from 'controllers/quote.controller'

router.get('/', QuoteController.getAllQuotes)

export default router