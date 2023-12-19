import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const token =
        req.body.token || req.query.token || req.headers['x-access-token']

    if (!token) {
        return res.status(403).send({
            error: 'NO_TOKEN_PROVIDED',
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY!)
        req.user = decoded
    } catch (err) {
        return res.status(401).send({
            error: 'INVALID_TOKEN',
        })
    }
    return next()
}
