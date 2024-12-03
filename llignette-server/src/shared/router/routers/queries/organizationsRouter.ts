import {publicProcedure, router} from '../../trpc';
import {getAllOrganizations} from "../../../domain/llignette/structure/queries/Organizations";
import {activeModel} from "../../../../server/activeModel";

export interface Organization {
    uuid: string;
    name: string;
}

export type OrganizationsByUuid = {
    [key: string]: Organization
}

export const organizationsRouter = router({

    getAll: publicProcedure.query(() => getAllOrganizations(activeModel)),

});
