import * as QuoteService from 'services/quote.service'
import { RequestHandler } from 'express';

export const getAllQuotes: RequestHandler = async (req, res, next) => {
  const quotes = await QuoteService.getQuotes()
  res.json(quotes)
}