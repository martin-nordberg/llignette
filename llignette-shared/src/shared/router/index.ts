import {apiRouter} from './routers/api';
import {postsRouter} from './routers/posts';
import {subRouter} from './routers/sub';
import {router} from './trpc';
import {makeOrganizationsRouter} from "./routers/queries/organizationsRouter";
import {IModelService} from "../llignette/services/ModelService";


export function makeAppRouter(svc: IModelService) {
    return router({
        organizations: makeOrganizationsRouter(svc.organizationsService),

        posts: postsRouter,
        sub: subRouter,
        api: apiRouter,
    })
}

export type AppRouter = ReturnType<typeof makeAppRouter>


