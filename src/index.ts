import {ApolloServer} from "apollo-server";
import {schema} from "./schema";
import { context} from "./context";

export const server = new ApolloServer({schema, context})
const PORT = process.env.PORT || 3000

server.listen({port: PORT}).then((info) => console.log(`Server running at ${info.url}`))