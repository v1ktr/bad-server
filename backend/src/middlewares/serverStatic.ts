import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Определяем полный путь к запрашиваемому файлу
            const normalizedPath = path.normalize(req.path)
            const filePath = path.join(baseDir, normalizedPath)

            const resolvedPath = path.resolve(filePath)
            const resolvedBase = path.resolve(baseDir)

            if (!resolvedPath.startsWith(resolvedBase)) {
                return res.status(403).json({
                    message: 'Доступ запрещен',
                })
            }

            // Проверяем, существует ли файл
            fs.access(resolvedPath, fs.constants.F_OK, (accessError) => {
                if (accessError) {
                    return next()
                }

                return res.sendFile(resolvedPath, (sendError) => {
                    if (sendError) {
                        next(sendError)
                    }
                })
            })
        } catch (error) {
            return next(error)
        }
    }
}