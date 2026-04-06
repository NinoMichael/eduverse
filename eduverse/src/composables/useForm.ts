import { ref, computed } from "vue";
import type { ValidationRule } from "@/utils/validation";
import { validate } from "@/utils/validation";

export function useForm<T extends Record<string, string>>(initialValues: T) {
	const values = ref<T>({ ...initialValues });
	const errors = ref<Partial<Record<keyof T, string>>>({});
	const touched = ref<Partial<Record<keyof T, boolean>>>({});
	const isSubmitting = ref(false);

	const isValid = computed(() => {
		return Object.values(errors.value).every((error) => !error);
	});

	const setFieldValue = (field: keyof T, value: string) => {
		values.value[field] = value;
	};

	const setFieldError = (field: keyof T, error: string | null) => {
		errors.value[field] = error ?? undefined;
	};

	const setFieldTouched = (field: keyof T) => {
		touched.value[field] = true;
	};

	const validateField = (field: keyof T, rules: ValidationRule[]) => {
		const error = validate(values.value[field], rules);
		setFieldError(field, error);
		return !error;
	};

	const validateAll = (
		rules: Partial<Record<keyof T, ValidationRule[]>>
	): boolean => {
		let isFormValid = true;

		for (const field in rules) {
			const fieldValid = validateField(field, rules[field]!);
			setFieldTouched(field);
			if (!fieldValid) isFormValid = false;
		}

		return isFormValid;
	};

	const reset = () => {
		values.value = { ...initialValues };
		errors.value = {};
		touched.value = {};
		isSubmitting.value = false;
	};

	return {
		values,
		errors,
		touched,
		isSubmitting,
		isValid,
		setFieldValue,
		setFieldError,
		setFieldTouched,
		validateField,
		validateAll,
		reset,
	};
}
