<script lang="ts">
    import {
        createTRPCClient,
        httpBatchLink,
        splitLink, unstable_httpSubscriptionLink,
    } from '@trpc/client';
    import superjson from 'superjson';
    import {serverConfig} from '$shared/config/server-config';
    import type {AppRouter} from '$shared/router';

    async function start() {
        const {port, prefix} = serverConfig;
        const urlEnd = `localhost:${port}${prefix}`;
        const trpc = createTRPCClient<AppRouter>({
            links: [
                splitLink({
                    condition(op) {
                        return op.type === 'subscription';
                    },
                    true: unstable_httpSubscriptionLink({
                        url: `http://${urlEnd}`,
                        transformer: superjson
                    }),
                    false: httpBatchLink({
                        url: `http://${urlEnd}`,
                        transformer: superjson,
                    }),
                }),
            ],
        });

        const version = await trpc.api.version.query();
        console.log('>>> anon:version:', version);

        const hello = await trpc.api.hello.query();
        console.log('>>> anon:hello:', hello);

        const postList = await trpc.posts.list.query();
        console.log('>>> anon:posts:list:', postList);

        await trpc.posts.reset.mutate();

        let randomNumberCount = 0;

        await new Promise<void>((resolve) => {
            const sub = trpc.sub.randomNumber.subscribe(undefined, {
                onData(data) {
                    console.log('>>> anon:sub:randomNumber:received:', data);
                    randomNumberCount++;

                    if (randomNumberCount > 3) {
                        sub.unsubscribe();
                        resolve();
                    }
                },
                onError(error) {
                    console.error('>>> anon:sub:randomNumber:error:', error);
                },
                onComplete() {
                    console.log('>>> anon:sub:randomNumber:', 'unsub() called');
                },
            });
        });

    }

    void start();

</script>

<h1>Welcome to Llignette Studio</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<button on:click={()=>start()}>A button, ha</button>
