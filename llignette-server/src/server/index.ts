import { serverConfig } from '../shared/config/server-config';
import { createServer } from './server';

const server = createServer(serverConfig);

void server.start();
