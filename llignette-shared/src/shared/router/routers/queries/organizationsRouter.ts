import {IOrganizationsService} from "../../../domain/llignette/services/structure/OrganizationsService";
import {publicProcedure, router} from '../../trpc';


export function makeOrganizationsRouter(svc: IOrganizationsService) {
    return router({
        getAll: publicProcedure.query(() => svc.queryAllOrganizations()),
    })
}

