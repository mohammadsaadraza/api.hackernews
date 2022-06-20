import {extendType, nonNull, objectType, stringArg} from "nexus";
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import {config} from "../config";

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t){
        t.nonNull.string("token")
        t.nonNull.field("user", {
            type: "User"
        })
    }
})

export const AuthQuery = extendType({
    type: "Query",
    definition(t){
        t.field("user", {
            type: "User",
            resolve(parent,args,context){
                const { userId } = context
                if(!userId){
                    throw new Error("No user logged in.")
                }

                return context.prisma.user.findUnique({
                    where: {
                        id: userId
                    }
                })
            }
        })
    }
})

export const AuthMutation = extendType({
    type: "Mutation",
    definition(t){
        t.nonNull.field("signup", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                name: nonNull(stringArg())
            },
            async resolve(parent, args, context){
                const { email, name } = args

                const password = await bcrypt.hash(args.password, 10)

                const user = await context.prisma.user.create({
                    data: {
                        email,
                        password,
                        name
                    }
                })

                const token = jwt.sign({ userId: user.id}, config.JWT_SECRET)

                return {
                    token,
                    user
                }
            }
        })

        t.nonNull.field("login", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            async resolve(parent, args, context){
                const { email, password } = args

                const user = await context.prisma.user.findUnique({
                    where: {
                        email
                    }
                })
                if(!user){
                    throw new Error("User doesn't exist.")
                }

                const compare = await bcrypt.compare(password, user.password)
                if (!compare){
                    throw new Error("Invalid Password.")
                }

                const token = jwt.sign({ userId: user.id}, config.JWT_SECRET)

                return {
                    token,
                    user
                }
            }
        })
    }
})

