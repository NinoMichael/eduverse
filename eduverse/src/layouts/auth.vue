<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const containerRef = ref<HTMLDivElement | null>(null);
const isOverflowing = ref(false);

const checkOverflow = () => {
	if (containerRef.value) {
		isOverflowing.value =
			containerRef.value.scrollHeight > containerRef.value.clientHeight ||
			containerRef.value.scrollWidth > containerRef.value.clientWidth;
	}
};

onMounted(() => {
	checkOverflow();
	window.addEventListener("resize", checkOverflow);
});

onUnmounted(() => {
	window.removeEventListener("resize", checkOverflow);
});
</script>

<template>
	<div
		ref="containerRef"
		class="flex justify-center items-center p-4 sm:p-6 md:p-8 bg-linear-to-br from-background to-gray-100"
	>
		<div
			class="w-full max-w-4xl mx-auto overflow-hidden"
			:class="{ 'h-full flex flex-col': isOverflowing }"
		>
			<router-view class="flex-1" />
		</div>
	</div>
</template>

<style scoped>
@media (max-height: 600px) {
	div[ref="containerRef"] {
		align-items: flex-start;
		padding-top: 1rem;
	}
}
</style>
