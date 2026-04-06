<script setup lang="ts">
interface Props {
	label?: string;
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
}

withDefaults(defineProps<Props>(), {
	label: "",
	variant: "primary",
	size: "md",
	loading: false,
	disabled: false,
	fullWidth: true,
});

const sizeClasses = {
	sm: "px-4 py-2 text-sm",
	md: "px-6 py-3 text-base",
	lg: "px-8 py-4 text-lg",
};
</script>

<template>
	<button
		type="button"
		:disabled="disabled || loading"
		:class="[
			'font-semibold rounded-lg transition-all duration-200 cursor-pointer',
			'hover:scale-[1.02] active:scale-[0.98]',
			'disabled:cursor-not-allowed disabled:hover:scale-100',
			fullWidth ? 'w-full' : 'w-auto',
			sizeClasses[size],
			variant === 'primary' &&
				'bg-primary hover:bg-primary/90 text-white shadow-sm',
			variant === 'secondary' && 'bg-gray-100 hover:bg-gray-200 text-gray-700',
			variant === 'outline' &&
				'border-2 border-primary text-primary hover:bg-primary/5',
			loading && 'opacity-70',
		]"
	>
		<span v-if="loading" class="flex items-center justify-center gap-2">
			<font-awesome-icon icon="spinner" class="animate-spin" />
			<span>Chargement...</span>
		</span>
		<span v-else>{{ label }}</span>
	</button>
</template>

<script lang="ts">
export default {
	name: "BaseButton",
};
</script>
