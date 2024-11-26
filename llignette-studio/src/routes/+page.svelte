<script lang="ts">
    import {trpc} from "$lib/trpc";
    import type {OrganizationsByUuid} from "$shared/router/routers/queries/organizations";

    async function callTrpcSample() {

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

    type Model = {
        hello: { text: string, stuff: string },
        organizations: OrganizationsByUuid,
        plenty: string
    }

    let model: Model = {
        hello: {text: "", stuff: ""},
        organizations: {},
        plenty: ""
    }

    const init = async () => {

        const hello = await trpc.api.hello.query();
        console.log('>>> anon:hello:', hello);

        const organizations = await trpc.organizations.list.query();
        console.log('>>> anon:organizations:', organizations);

        model = {
            hello,
            organizations,
            plenty: "bonus"
        };

        return true
    };

</script>

<h1>Welcome to Llignette Studio</h1>

<button class="button is-small" onclick={()=>callTrpcSample()}>A Button</button>

{#await init()}
    <p>Loading ...</p>
{:then _ready}

    {model.hello.text}<br>
    {model.hello.stuff}<br>
    {model.plenty}

    <ul>
        {#each Object.entries(model.organizations) as [key, value]}
            <li><a href="./organizations/{key}">{value.name}</a></li>
        {/each}
    </ul>

{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
