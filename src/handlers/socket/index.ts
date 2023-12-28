import { PrismaClient } from "@prisma/client"
import { Server } from "socket.io"

interface CountInstance {
    count: number
    spaceId: string
    cameraId: number
    authToken: string
}

export const setupSocketHandlers = (io: Server, prisma: PrismaClient) => {
    io.on('connection', (socket) => {
        console.log('user connected!')

        socket.on(
            'count',
            ({ count, spaceId, cameraId, authToken }: CountInstance) => {
                if (authToken === process.env.TOKEN_KEY) {
                    console.log('count received', count, spaceId, cameraId)
                    prisma.sportSpace
                        .findFirst({
                            where: {
                                id: spaceId,
                            },
                        })
                        .then((space) => {
                            if (space) {
                                const { availability } = space
                                prisma.sportSpace
                                    .update({
                                        where: {
                                            id: spaceId,
                                        },
                                        data: {
                                            availability: (
                                                availability as number[]
                                            ).map((num, i) =>
                                                i !== cameraId ? num : count
                                            ),
                                        },
                                    })
                                    .then((newSpace) => {
                                        socket.broadcast.emit(
                                            'update',
                                            newSpace
                                        )
                                    })
                            } else {
                                console.log('Space not found')
                            }
                        })
                } else {
                    socket.disconnect();
                }
            }
        )

        socket.on('disconnect', () => {
            console.log('A user just disconnected')
        })
    })
}