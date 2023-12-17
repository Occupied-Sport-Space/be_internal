import { PrismaClient } from '@prisma/client'
import { Express } from 'express'

export const setupRestHandlers = (app: Express, prisma: PrismaClient) => {
    app.get('/', (_, res) => {
        res.send({
            message: 'Welcome to the OSS API',
        })
    })

    app.get('/spaces', async (_, res) => {
        const spaces = await prisma.sportSpace.findMany()
        res.send(spaces)
    })
}
