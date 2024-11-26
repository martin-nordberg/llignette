<script lang="ts">
    // TODO import Header from './Header.svelte';
    import '../css/lignette-studio.scss';
    import NavBar from "$lib/components/NavBar.svelte";

    let {children} = $props();
</script>

<div class="app">
    <NavBar />

    <main>
        {@render children()}
    </main>

    <footer>
        <p>
            Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to learn about SvelteKit
        </p>
    </footer>
</div>

<style lang="scss">
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    font-size: smaller;
    justify-content: center;
    align-items: center;
    padding: 12px;

    a {
      font-weight: bold;
      font-style: italic;
    }
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
