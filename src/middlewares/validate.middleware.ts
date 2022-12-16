import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "lib/utility-classes";
export default (schema: AnyZodObject) =>
  async (req: Request<unknown>, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const invalids = error.issues.map( issue => issue.path.pop() )
        next(new AppError('validation', `Invalid or missing input${invalids.length > 1 ? 's' : ''} provided for: ${invalids.join(', ')}`))
      } else {
        next(new AppError('validation', 'Invalid input'))
      }
    }
};