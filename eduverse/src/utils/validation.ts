export interface ValidationRule {
	validate: (value: string) => boolean;
	message: string;
}

export const required = (message = "Ce champ est requis"): ValidationRule => ({
	validate: (value: string) => value.trim().length > 0,
	message,
});

export const minLength =
	(min: number, message?: string): ValidationRule => ({
		validate: (value: string) => value.length >= min,
		message: message || `Minimum ${min} caractères requis`,
	});

export const maxLength =
	(max: number, message?: string): ValidationRule => ({
		validate: (value: string) => value.length <= max,
		message: message || `Maximum ${max} caractères autorisés`,
	});

export const password = (message?: string): ValidationRule => ({
	validate: (value: string) =>
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(value),
	message:
		message ||
		"8 caractères minimum, incluant majuscule, minuscule et chiffre",
});

export const passwordMatch =
	(matchValue: string, message?: string): ValidationRule => ({
		validate: (value: string) => value === matchValue,
		message: message || "Les mots de passe ne correspondent pas",
	});

export function validate(
	value: string,
	rules: ValidationRule[]
): string | null {
	for (const rule of rules) {
		if (!rule.validate(value)) {
			return rule.message;
		}
	}
	return null;
}
