import { PrismaClient } from '@prisma/client'
import { Express } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../../middleware/auth'

export const setupRestHandlers = (app: Express, prisma: PrismaClient) => {
    app.get('/', (_, res) => {
        res.send({
            message: 'Welcome to the OSS API',
        })
    })

    app.get('/spaces', verifyToken, async (_, res) => {
        const spaces = await prisma.sportSpace.findMany()
        res.send(spaces)
    })

    app.post('/register', async (req, res) => {
        try {
            const { name, email, password } = req.body

            if (!(email && password && name)) {
                res.status(400).send('All input is required')
            }

            const oldUser = await prisma.user.findFirst({
                where: {
                    email: email.toLowerCase(),
                },
            })

            if (oldUser) {
                return res.status(409).send('User Already Exist. Please Login')
            }

            const encryptedUserPassword = await bcrypt.hash(password, 10)

            const user = await prisma.user.create({
                data: {
                    name: name,
                    email: email.toLowerCase(),
                    password: encryptedUserPassword,
                    favorites: [],
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
            if (!(email && password)) {
                res.status(400).send('All input is required')
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
            return res.status(400).send('Invalid Credentials')
        }
    })
}
