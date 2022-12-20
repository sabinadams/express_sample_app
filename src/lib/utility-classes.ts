export class AppError extends Error {
  statusCode = 400
  static typeToCode = {
    validation: 400,
    unauthorized: 401,
    server: 500
  }
  constructor(type: keyof typeof AppError.typeToCode, message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = Error.name
    this.statusCode = AppError.typeToCode[type]
    Error.captureStackTrace(this)
  }
}
