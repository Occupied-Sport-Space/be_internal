import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { setupSocketHandlers } from './handlers/socket'
import { setupRestHandlers } from './handlers/rest'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()
const PORT = 8000

const main = async () => {
    const app = express()
    const httpServer = createServer(app)
    const io = new Server(httpServer)

    setupSocketHandlers(io, prisma);
    setupRestHandlers(app, prisma);

    httpServer.listen(PORT)
    console.log(`Server connected on port ${PORT}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
