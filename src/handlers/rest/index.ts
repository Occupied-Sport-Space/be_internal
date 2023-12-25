import { PrismaClient } from '@prisma/client'
import { Express } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../../middleware/auth'
import winston from 'winston'

const logger = winston.createLogger({
    // Log only if level is less than (meaning more severe) or equal to this
    level: 'info',
    // Use timestamp and printf to create a standard log format
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    // Log to the console and a file
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' }),
    ],
})

export const setupRestHandlers = (app: Express, prisma: PrismaClient) => {
    app.use((req, _, next) => {
        logger.info(`${req.method} request for ${req.url}`)
        next()
    })

    app.get('/', (_, res) => {
        res.send({
            message: 'Welcome to the OSS API',
        })
    })

    app.get('/spaces', verifyToken, async (_, res) => {
        const spaces = await prisma.sportSpace.findMany()
        res.send(spaces)
    })

    app.patch('/user', verifyToken, async (req: any, res) => {
        const { name, email } = req.body

        if (!(name || email)) {
            return res.status(400).send({
                error: 'AT_LEAST_ONE_INPUT_REQUIRED',
            })
        }

        const user = await prisma.user.findFirst({
            where: {
                id: req.user.user_id,
            },
        })

        if (!user) {
            return res.status(400).send({
                error: 'USER_NOT_FOUND',
            })
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: req.user.user_id,
            },
            data: {
                name: name ? name : user.name,
                email: email ? email : user.email,
            },
        })

        return res.status(200).send(updatedUser)
    })

    app.patch('/add-favorite', verifyToken, async (req: any, res) => {
        const { spaceId } = req.body

        const user = await prisma.user.findFirst({
            where: {
                id: req.user.user_id,
            },
        })

        if (user) {
            const { favorites } = user

            if (!(favorites as string[])!.includes(spaceId)) {
                const newFavorites = [...(favorites as string[]), spaceId]
                const updatedUser = await prisma.user.update({
                    where: {
                        id: req.user.user_id,
                    },
                    data: {
                        favorites: newFavorites,
                    },
                })
                return res.status(200).send(updatedUser)
            } else {
                const newFavorites = (favorites as string[]).filter(
                    (id) => id !== spaceId
                )
                const updatedUser = await prisma.user.update({
                    where: {
                        id: req.user.user_id,
                    },
                    data: {
                        favorites: newFavorites,
                    },
                })

                return res.status(200).send(updatedUser)
            }
        }

        return res.status(400).send({
            error: 'USER_NOT_FOUND',
        })
    })

    app.post('/register', async (req, res) => {
        try {
            const { name, email, password } = req.body

            if (!(email && password && name)) {
                return res.status(400).send({
                    error: 'ALL_INPUTS_REQUIRED',
                })
            }

            const oldUser = await prisma.user.findFirst({
                where: {
                    email: email.toLowerCase(),
                },
            })

            if (oldUser) {
                return res.status(409).send({
                    error: 'USER_ALREADY_EXISTS',
                })
            }

            const encryptedUserPassword = await bcrypt.hash(password, 10)

            const user = await prisma.user.create({
                data: {
                    name: name,
                    email: email.toLowerCase(),
                    password: encryptedUserPassword,
                    favorites: [],
                    token: '',
                },
            })

            const token = jwt.sign(
                { user_id: user.id, email },
                process.env.TOKEN_KEY!,
                {
                    expiresIn: '5h',
                }
            )

            const updatedUser = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    token,
                },
            })

            res.status(201).json(updatedUser)
        } catch (err) {
            console.log(err)
        }
    })

    app.post('/login', async (req, res) => {
        try {
            // Get user input
            const { email, password } = req.body

            // Validate user input
            if (!email || !password) {
                return res.status(400).send({
                    error: 'ALL_INPUTS_REQUIRED',
                })
            }
            // Validate if user exist in our database
            const user = await prisma.user.findFirst({ where: { email } })

            if (user && (await bcrypt.compare(password, user.password))) {
                // Create token
                const token = jwt.sign(
                    { user_id: user.id, email },
                    process.env.TOKEN_KEY!,
                    {
                        expiresIn: '5h',
                    }
                )

                // save user token
                const updatedUser = await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        token,
                    },
                })

                // user
                return res.status(200).json(updatedUser)
            }
        } catch (err) {
            return res.status(400).send({
                error: 'INVALID_CREDENTIALS',
            })
        }
    })
}
