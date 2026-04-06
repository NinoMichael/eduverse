<script setup lang="ts">
interface Props {
	modelValue: string;
	type?: string;
	placeholder?: string;
	icon?: string;
	label?: string;
	error?: string;
	disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	type: "text",
	placeholder: "",
	icon: "",
	label: "",
	error: "",
	disabled: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

const updateValue = (event: Event) => {
	const target = event.target as HTMLInputElement;
	emit("update:modelValue", target.value);
};
</script>

<template>
	<div class="space-y-2">
		<label v-if="label" class="flex items-center gap-2 font-medium opacity-90">
			<font-awesome-icon v-if="icon" :icon="icon" />
			<span>{{ label }}</span>
		</label>
		<input
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:class="[
				'h-11 w-full border rounded-lg outline-none px-4 transition-all duration-200',
				'bg-white text-gray-700 placeholder-gray-400',
				'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
				error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
				disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '',
			]"
			@input="updateValue"
		/>
		<p v-if="error" class="text-xs text-red-500">{{ error }}</p>
	</div>
</template>

<script lang="ts">
export default {
	name: "FormInput",
};
</script>
