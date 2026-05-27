import { Router } from 'express'
import csrf from 'csurf'

const router = Router()

const csrfProtection = csrf({
    cookie: true,
})

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({
        csrfToken: req.csrfToken(),
    })
})

export default router