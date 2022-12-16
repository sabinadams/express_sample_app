import { Router } from "express";
const router = Router()
import * as QuoteController from 'controllers/quote.controller'
import authorizationMiddleware from 'middlewares/authorization.middleware';

router.get('/', authorizationMiddleware, QuoteController.getAllQuotes)

export default router