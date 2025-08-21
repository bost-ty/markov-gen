<script lang="ts">
	import '../app.css';

	// Pre-render required for adapter-static
	export const prerender = true;

	let { children } = $props();
</script>

<div class="absolute top-1 right-1">
	<a class="text-sky-700 hover:text-sky-800"
	   href="https://bostwick.dev"
	>see more @ bostwick.dev</a>
</div>

{@render children()}
