import { PrismaClient } from '@prisma/client'
import { Server } from 'socket.io'

interface CountInstance {
    count: number
    spaceId: string
    cameraId: number
    authToken: string
}

export const setupSocketHandlers = (io: Server, prisma: PrismaClient) => {
    setInterval(() => {
        prisma.sportSpace
            .findMany({
                where: {
                    planningOnGoing: {
                        not: [],
                    },
                },
            })
            .then((spaces): void => {
                spaces.forEach((space) => {
                    const updatedPlanningOnGoing = (
                        space.planningOnGoing as any
                    )
                        .filter(({ time }: any) => time > 0)
                        .map((plan: { time: number; email: string }) => ({
                            ...plan,
                            time: plan.time - 60,
                        }))

                    prisma.sportSpace
                        .update({
                            where: {
                                id: space.id,
                            },
                            data: {
                                planningOnGoing: updatedPlanningOnGoing,
                            },
                        })
                        .then((updatedSpace) => {
                            console.log(
                                'Timer',
                                updatedSpace.planningOnGoing,
                                updatedSpace.name
                            )
                        })
                })
            })
    }, 60000)

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
                    socket.disconnect()
                }
            }
        )

        socket.on('disconnect', () => {
            console.log('A user just disconnected')
        })
    })
}
