import {apiRouter} from './routers/api';
import {postsRouter} from './routers/posts';
import {subRouter} from './routers/sub';
import {router} from './trpc';
import {makeOrganizationsRouter} from "./routers/queries/organizationsRouter";
import {IOrganizationsService} from "../domain/llignette/services/structure/OrganizationsService";


export function makeAppRouter(svc: IOrganizationsService) {
    return router({
        organizations: makeOrganizationsRouter(svc),

        posts: postsRouter,
        sub: subRouter,
        api: apiRouter,
    })
}

export type AppRouter = ReturnType<typeof makeAppRouter>


