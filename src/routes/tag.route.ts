import { Router } from "express";
const router = Router()

router.get('/', (req, res, next) => {
  res.json([])
})

export default router