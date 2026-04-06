<script setup lang="ts">
interface Option {
	value: string;
	label: string;
}

interface Props {
	modelValue: string;
	options: Option[];
	placeholder?: string;
	icon?: string;
	label?: string;
	error?: string;
	disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	placeholder: "Sélectionner",
	icon: "",
	label: "",
	error: "",
	disabled: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

const updateValue = (event: Event) => {
	const target = event.target as HTMLSelectElement;
	emit("update:modelValue", target.value);
};
</script>

<template>
	<div class="space-y-2">
		<label v-if="label" class="flex items-center gap-2 font-medium opacity-90">
			<font-awesome-icon v-if="icon" :icon="icon" />
			<span>{{ label }}</span>
		</label>
		<div class="relative">
			<select
				:value="modelValue"
				:disabled="disabled"
				:class="[
					'h-11 w-full border rounded-lg outline-none px-4 pr-10 transition-all duration-200 appearance-none cursor-pointer',
					'bg-white text-gray-700',
					'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
					error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
					disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '',
				]"
				@change="updateValue"
			>
				<option value="" disabled>{{ placeholder }}</option>
				<option v-for="opt in options" :key="opt.value" :value="opt.value">
					{{ opt.label }}
				</option>
			</select>
			<font-awesome-icon
				icon="chevron-down"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
			/>
		</div>
		<p v-if="error" class="text-xs text-red-500">{{ error }}</p>
	</div>
</template>

<script lang="ts">
export default {
	name: "FormSelect",
};
</script>
