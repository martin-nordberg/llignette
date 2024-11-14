import {serverConfig} from "$shared/config/server-config";
import {createTRPCClient, httpLink, splitLink, unstable_httpSubscriptionLink} from "@trpc/client";
import type {AppRouter} from "$shared/router";
import superjson from "superjson";

const {port, prefix} = serverConfig;

const urlEnd = `localhost:${port}${prefix}`;

export const trpc = createTRPCClient<AppRouter>({
    links: [
        splitLink({
            condition(op) {
                return op.type === 'subscription';
            },
            true: unstable_httpSubscriptionLink({
                url: `http://${urlEnd}`,
                transformer: superjson
            }),
            false: httpLink({
                url: `http://${urlEnd}`,
                transformer: superjson,
            }),
        }),
    ],
});