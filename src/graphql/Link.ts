import {arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg} from "nexus";
import { Prisma } from "@prisma/client"

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        // @ts-ignore
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {
            type: "User",
            resolve(parent, args,context){
                return context.prisma.link.findUnique({
                    where: {
                        id: parent.id
                    }
                }).postedBy()
            }
        })
        t.nonNull.list.nonNull.field("voters",{
            type: "User",
            resolve(parent, args,context){
                return context.prisma.link.findUnique({
                    where: {
                        id: parent.id
                    }
                }).voters()
            }
        })
    }
})

export const Sort = enumType({
    name: "Sort",
    members: ["desc", "asc"]
})

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t){
        t.field("createdAt", { type: Sort})
        t.field("description", { type: Sort})
        t.field("url", { type: Sort})
    }
})

export const Feed = objectType({
    name: "Feed",
    definition(t){
        t.nonNull.list.nonNull.field("links", { type: "Link"})
        t.nonNull.int("count")
        t.id("id")
    }
})

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                take: intArg(),
                skip: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput))})
            },
            async resolve(parent, args, context, info){
                const where = args.filter ?
                    {
                        OR: [
                            { description: { contains: args.filter}},
                            { url: { contains: args.filter}}
                        ]
                    } : {}
                const links = await context.prisma.link.findMany({
                    where,
                    take: args?.take as number | undefined,
                    skip: args?.skip as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined
                })

                const count = await context.prisma.link.count({ where })

                const id = `main-feed:${JSON.stringify(args)}`

                return {
                    links,
                    count,
                    id
                }
            }
        })
    }
})

export const getLinkByIDQuery = extendType({
    type: "Query",
    definition(t){
        t.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg())
            },
            resolve(parent, args, context, info){
                return context.prisma.link.findUnique({
                    where: {
                        id: args.id
                    }
                })
            }
        })
    }
})

export const updateLinkByID = extendType({
    type: "Mutation",
    definition(t){
        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },
            async resolve(parent,args, context){
                const { userId } = context
                if(!userId){
                    throw new Error("Must be logged in to update link")
                }

                await context.prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        links: {
                            update: {
                                where: {
                                    id: args.id
                                },
                                data: {
                                    description: args.description,
                                    url: args.url
                                }
                            },
                        }
                    }
                })

                const updated =  await context.prisma.link.findUnique({
                    where: {
                        id: args.id
                    }
                })
                if(!updated) throw new Error("Invalid Link Id")

                return updated
            }
        })
    }
})

export const deleteLinkByID = extendType({
    type: "Mutation",
    definition(t){
        t.nonNull.field("deleteLink", {
            type: "Int",
            args: {
                id: nonNull(intArg())
            },
            async resolve(parent, args, context, info){
                const { userId } = context
                if(!userId){
                    throw new Error("Must be logged in to delete a link.")
                }

                await context.prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        links: {
                            delete: {
                                id: args.id
                            }
                        }
                    }
                })

                return args.id
            }
        })
    }
})

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },
            resolve(parent, args,context){
                const { userId } = context

                if(!userId){
                    throw new Error("Must be logged in to post a link.")
                }
                return context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url,
                        postedBy: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                })
            }
        })
    }
})