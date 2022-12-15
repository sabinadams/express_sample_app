import { Router } from 'express'
const router = Router()

import quote from './quote.route'
import auth from './auth.route'
import tag from './tag.route'

router.use('/quote', quote)
router.use('/auth', auth) 
router.use('/tag', tag)

router.all('*', ( req, res, next ) => {
	res.status(404).json({
		message: 'The requested resource could not be found.',
		path: req.path
	})
})

export default router