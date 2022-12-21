import { z } from 'zod'

// Signup Schema & Type
export const SignupSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string()
  })
})
export type SignupSchema = z.infer<typeof SignupSchema>['body']

// Signin Schema & Type
export const SigninSchema = SignupSchema
export type SigninSchema = SignupSchema
