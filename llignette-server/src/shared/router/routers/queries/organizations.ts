import {TRPCError} from '@trpc/server';
import {z} from 'zod';
import {publicProcedure, router} from '../../trpc';

export interface Organization {
    uuid: string;
    name: string;
}

export type OrganizationsByUuid = {
    [key: string]: Organization
}

type Db = {
    organizations: OrganizationsByUuid;
}

const db: Db = {
    organizations: {
        "01932d40-5bba-76a7-8bae-55c531fef9a7": {
            uuid: "01932d40-5bba-76a7-8bae-55c531fef9a7",
            name: "Acme, Inc."
        },
        "01932d40-5bba-77d1-b29a-8c28300068eb": {
            uuid: "01932d40-5bba-77d1-b29a-8c28300068eb",
            name: "Beta, LLC"
        },
        "01932d40-5bba-72d0-bfcd-4ec5d7761d89": {
            uuid: "01932d40-5bba-72d0-bfcd-4ec5d7761d89",
            name: "Company.com"
        }
    }
};

export const organizationsRouter = router({

    create: publicProcedure
        .input(z.object({name: z.string()}))
        .mutation(({input, ctx}) => {
            if (ctx.user.name !== 'nyan') {
                throw new TRPCError({code: 'UNAUTHORIZED'});
            }

            const uuid = "01932d48-52c8-7322-a219-4e730010f0c6"
            const organization = {uuid, ...input};
            db.organizations[organization.uuid] = organization;
            return organization;
        }),

    list: publicProcedure.query(() => db.organizations),

    reset: publicProcedure.mutation(() => {
        db.organizations = {};
    }),

});
