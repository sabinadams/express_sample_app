import auth from './auth.route'
import quote from './quote.route'
import { Router } from 'express'
import authorizationMiddleware from 'middlewares/authorization.middleware'

const router = Router()

router.use('/auth', auth)
router.use('/quote', authorizationMiddleware, quote)

router.all('*', (req, res) => {
  res.status(404).json({
    message: 'The requested resource could not be found.',
    path: req.path
  })
})

export default router
