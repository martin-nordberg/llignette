import type {PageLoad} from './$types';
import {trpc} from "$lib/trpc";

export const load: PageLoad = async ({parent}) => {

    const hello = await trpc.api.hello.query();
    console.log('>>> anon:hello:', hello);

    const organizations = await trpc.organizations.list.query();
    console.log('>>> anon:organizations:', organizations);

    const redundant = await parent()

    return {
        hello,
        organizations,
        redundant,
        more: "Extra"
    };

};