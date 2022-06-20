import {ApolloServer} from "apollo-server";
import {ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core"
import {schema} from "./schema";
import { context} from "./context";

export const server = new ApolloServer({schema, context, introspection: true, plugins: [ApolloServerPluginLandingPageGraphQLPlayground]})
const PORT = process.env.PORT || 3000

server.listen({port: PORT}).then((info) => console.log(`Server running at ${info.url}`))