import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { mkdirSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const allowedMimeTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
]

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const destinationPath = path.join(
            __dirname,
            process.env.UPLOAD_PATH_TEMP
                ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                : '../public'
        )

        mkdirSync(destinationPath, { recursive: true })

        cb(null, destinationPath)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const extension = path.extname(file.originalname)

        const safeFileName = `${crypto.randomUUID()}${extension}`

        cb(null, safeFileName)
    },
})

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Недопустимый тип файла'))
    }

    if (file.size < 2 * 1024) {
        return cb(new Error('Файл слишком маленький'))
    }

    return cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
})
