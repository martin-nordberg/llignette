import {apiRouter} from './routers/api';
import {postsRouter} from './routers/posts';
import {subRouter} from './routers/sub';
import {router} from './trpc';
import {organizationsRouter} from "./routers/queries/organizations";

export const appRouter = router({
    organizations: organizationsRouter,

    posts: postsRouter,
    sub: subRouter,
    api: apiRouter,
});

export type AppRouter = typeof appRouter;
