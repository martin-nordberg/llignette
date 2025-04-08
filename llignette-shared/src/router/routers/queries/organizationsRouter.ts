import {IOrganizationServices} from "$shared/llignette/services/structure/OrganizationServices";
import {publicProcedure, router} from '../../trpc';


export function makeOrganizationsRouter(svc: IOrganizationServices) {
    return router({
        getAll: publicProcedure.query(() => svc.findOrganizationsAll()),
    })
}

