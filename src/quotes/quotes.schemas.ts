import { z } from 'zod'

// Create Quote Schema & Type
export const CreateQuoteSchema = z.object({
  body: z.object({
    tags: z.string().array().optional(),
    text: z.string()
  })
})
export type CreateQuoteSchema = z.infer<typeof CreateQuoteSchema>['body']

// Delete Quote Schema
export const DeleteQuoteSchema = z.object({
  params: z.object({
    id: z.string()
  })
})
export type DeleteQuoteSchema = z.infer<typeof DeleteQuoteSchema>['params']
