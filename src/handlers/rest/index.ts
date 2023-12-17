import { PrismaClient } from '@prisma/client'
import { Express } from 'express'
import { auth } from 'express-openid-connect'

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
}

export const setupRestHandlers = (app: Express, prisma: PrismaClient) => {
    app.use(auth(config))

    app.get('/', (req, res) => {
        res.send({
            message: 'Welcome to the OSS API',
            auth: req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out',
        })
    })

    app.get('/spaces', async (req, res) => {
        const spaces = req.oidc.isAuthenticated()
            ? await prisma.sportSpace.findMany()
            : []
        res.send(spaces)
    })
}
