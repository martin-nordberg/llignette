import {fastifyTRPCPlugin} from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import cors from '@fastify/cors'
import {activeModelService} from "./activeModel";
import {ServerOptions} from "$shared/config/server-options";
import {makeAppRouter} from "$shared/router";
import {createContext} from "$shared/router/context";


export function createServer(opts: ServerOptions) {
    const dev = opts.dev ?? true
    const port = opts.port ?? 3001
    const prefix = opts.prefix ?? '/trpc'
    const server = fastify({logger: dev})

    void server.register(cors, {
        origin: "http://localhost:5173"
    })

    void server.register(fastifyTRPCPlugin, {
        prefix,
        trpcOptions: {
            router: makeAppRouter(activeModelService),
            createContext
        },
    })

    server.get('/', async () => {
        return {hello: 'wait-on 💨'};
    })

    const stop = async () => {
        await server.close();
    }

    const start = async () => {
        try {
            await server.listen({port});
            console.log('Llignette App Server listening on port', port);
        } catch (err) {
            server.log.error(err);
            process.exit(1);
        }
    }

    return {server, start, stop}
}
