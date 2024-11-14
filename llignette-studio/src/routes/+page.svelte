<script lang="ts">
    import type { PageData } from './$types';
    import {trpc} from "$lib/trpc";

    async function start() {

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

                    if (randomNumberCount > 10) {
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

    let { data }: { data: PageData } = $props();
</script>

<h1>Welcome to Llignette Studio</h1>

<button class="button is-small" onclick={()=>start()}>A Button</button>

{data.hello.text}<br>
{data.hello.stuff}