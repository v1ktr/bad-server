import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import hpp from 'hpp'
import csrfRouter from './routes/csrf'

const { PORT = 3000 } = process.env
const app = express()

mongoose.set('sanitizeFilter', true)

app.use(helmet())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Слишком много запросов. Попробуйте позже.',
    },
})

app.use(limiter)

app.use(cookieParser())

app.use(cors({ origin: process.env.ORIGIN_ALLOW, credentials: true }))

app.use('/auth', csrfRouter)

app.use(
    json({
        limit: '10kb',
    })
)

app.use(
    urlencoded({
        extended: false,
        limit: '10kb',
    })
)

app.use(
    mongoSanitize({
        replaceWith: '_',
    })
)

app.use(hpp())

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
        })
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
