<script setup lang="ts">
import { ref, computed } from "vue";

interface Toast {
	id: number;
	type: "success" | "error" | "warning" | "info";
	message: string;
	duration?: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

const iconMap = {
	success: "check-circle",
	error: "exclamation-circle",
	warning: "exclamation-triangle",
	info: "info-circle",
};

const typeClasses = computed(() => ({
	success: "bg-green-50 text-green-800 border-green-200",
	error: "bg-red-50 text-red-800 border-red-200",
	warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
	info: "bg-blue-50 text-blue-800 border-blue-200",
}));

function addToast(
	type: Toast["type"],
	message: string,
	duration = 5000
): number {
	const id = nextId++;
	toasts.value.push({ id, type, message, duration });

	if (duration > 0) {
		setTimeout(() => removeToast(id), duration);
	}

	return id;
}

function removeToast(id: number) {
	const index = toasts.value.findIndex((t) => t.id === id);
	if (index > -1) {
		toasts.value.splice(index, 1);
	}
}

defineExpose({
	success: (msg: string, duration?: number) => addToast("success", msg, duration),
	error: (msg: string, duration?: number) => addToast("error", msg, duration),
	warning: (msg: string, duration?: number) => addToast("warning", msg, duration),
	info: (msg: string, duration?: number) => addToast("info", msg, duration),
	remove: removeToast,
});
</script>

<template>
	<div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
		<TransitionGroup name="toast">
			<div
				v-for="toast in toasts"
				:key="toast.id"
				:class="[
					'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
					typeClasses[toast.type],
				]"
			>
				<font-awesome-icon
					:icon="iconMap[toast.type]"
					class="flex-shrink-0 mt-0.5"
				/>
				<p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
				<button
					class="flex-shrink-0 hover:opacity-70 transition-opacity"
					@click="removeToast(toast.id)"
				>
					<font-awesome-icon icon="times" />
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<style scoped>
.toast-enter-active {
	transition: all 0.4s ease-out;
}

.toast-leave-active {
	transition: all 0.3s ease-in;
}

.toast-enter-from {
	opacity: 0;
	transform: translateX(100px);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(100px);
}

.toast-move {
	transition: transform 0.3s ease;
}
</style>
