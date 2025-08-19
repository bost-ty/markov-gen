<script lang="ts">
	import '../app.css';

	// Pre-render required for adapter-static
	export const prerender = true;

	let { children } = $props();
</script>

{@render children()}
