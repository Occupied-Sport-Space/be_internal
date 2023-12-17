import { PrismaClient } from "@prisma/client"
import { Server } from "socket.io"

interface CountInstance {
    count: number
    spaceId: string
    cameraId: number
}

export const setupSocketHandlers = (io: Server, prisma: PrismaClient) => {
    io.on('connection', (socket) => {
        console.log('user connected!')

        socket.on('count', ({ count, spaceId, cameraId }: CountInstance) => {
            prisma.sportSpace
                .findFirst({
                    where: {
                        id: spaceId,
                    },
                })
                .then((space) => {
                    if (space) {
                        const { availability } = space

                        if (count !== availability) {
                            console.log('new count: ', count)
                            prisma.sportSpace
                                .update({
                                    where: {
                                        id: spaceId,
                                    },
                                    data: {
                                        availability: count,
                                    },
                                })
                                .then((newSpace) => {
                                    socket.broadcast.emit('newCount', newSpace)
                                })
                        }
                    }
                })
        })

        socket.on('disconnect', () => {
            console.log('A user just disconnected')
        })
    })
}