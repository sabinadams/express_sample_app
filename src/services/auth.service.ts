import type { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from 'lib/prisma'

export const findUserByUsername = async (username: string) => {
  return await prisma.user.findFirst({ where: { username } })
}

export const createUser = async (
  user: Omit<Prisma.UserCreateInput, 'quotes'>
) => {
  user.password = bcrypt.hashSync(user.password, 8)

  return await prisma.user.create({
    data: user,
    select: {
      id: true,
      username: true
    }
  })
}

export const generateJWT = (id: number) => {
  if (!process.env.API_SECRET) {
    throw new Error('API Secret not defined. Unable to generate JWT.')
  }

  return jwt.sign({ id }, process.env.API_SECRET, { expiresIn: 86400 })
}

export const validateJWT = (token: string) => {
  if (!process.env.API_SECRET) {
    throw new Error('API Secret not defined. Unable to validate JWT.')
  }
  const payload = jwt.verify(token, process.env.API_SECRET) as { id: number }
  return payload.id
}

export const comparePasswords = (input: string, encrypted: string) => {
  return bcrypt.compareSync(input, encrypted)
}
