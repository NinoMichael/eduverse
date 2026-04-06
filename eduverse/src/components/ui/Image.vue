<script lang="ts" setup>
interface Props {
	src: string;
	alt?: string;
	ratio?: "square" | "video";
	cover?: boolean;
	rounded?: boolean;
}

withDefaults(defineProps<Props>(), {
	alt: "",
	ratio: undefined,
	cover: true,
	rounded: false,
});
</script>

<template>
	<div
		class="relative overflow-hidden"
		:class="[
			ratio === 'square' && 'aspect-square',
			ratio === 'video' && 'aspect-video',
			rounded && 'rounded-xl',
		]"
	>
		<img
			:src="src"
			:alt="alt"
			loading="lazy"
			decoding="async"
			class="w-full h-full"
			:class="cover ? 'object-cover' : 'object-contain'"
		/>
	</div>
</template>
