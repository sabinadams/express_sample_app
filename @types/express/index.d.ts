export {}
declare global {
  namespace Express {
    export interface Request {
      session: {
        userId: number
      }
    }
  }
}
