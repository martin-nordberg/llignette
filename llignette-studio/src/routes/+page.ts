import type {PageLoad} from './$types';
import {trpc} from "$lib/trpc";

export const load: PageLoad = async () => {

    const hello = await trpc.api.hello.query();
    console.log('>>> anon:hello:', hello);

    return {
        hello
    };

};