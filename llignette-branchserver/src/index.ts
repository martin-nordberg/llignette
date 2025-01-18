import {createServer} from './server';
import {serverConfig} from "$shared/config/server-config";


const server = createServer(serverConfig)

void server.start()
