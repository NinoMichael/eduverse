<script setup lang="ts">
import { computed } from "vue";

interface Props {
	message: string;
	type?: "success" | "error" | "warning" | "info";
	dismissible?: boolean;
}

withDefaults(defineProps<Props>(), {
	type: "info",
	dismissible: true,
});

const emit = defineEmits<{
	close: [];
}>();

const typeClasses = computed(() => ({
	success: "bg-green-50 text-green-800 border-green-200",
	error: "bg-red-50 text-red-800 border-red-200",
	warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
	info: "bg-blue-50 text-blue-800 border-blue-200",
}));

const iconMap = {
	success: "check-circle",
	error: "exclamation-circle",
	warning: "exclamation-triangle",
	info: "info-circle",
};
</script>

<template>
	<div
		:class="[
			'flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl',
			typeClasses[type],
		]"
	>
		<font-awesome-icon :icon="iconMap[type]" class="shrink-0 text-lg" />
		<p class="flex-1 text-sm font-medium">{{ message }}</p>
		<button
			v-if="dismissible"
			type="button"
			class="shrink-0 hover:opacity-70 transition-opacity p-1"
			@click="emit('close')"
		>
			<font-awesome-icon icon="times" />
		</button>
	</div>
</template>

<script lang="ts">
export default {
	name: "AlertMessage",
};
</script>