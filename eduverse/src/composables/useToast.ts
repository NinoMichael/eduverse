import { ref, readonly } from "vue";

interface Toast {
	id: number;
	type: "success" | "error" | "warning" | "info";
	message: string;
	duration?: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
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

	return {
		toasts: readonly(toasts),
		success: (msg: string, duration?: number) =>
			addToast("success", msg, duration),
		error: (msg: string, duration?: number) => addToast("error", msg, duration),
		warning: (msg: string, duration?: number) =>
			addToast("warning", msg, duration),
		info: (msg: string, duration?: number) => addToast("info", msg, duration),
		remove: removeToast,
	};
}
