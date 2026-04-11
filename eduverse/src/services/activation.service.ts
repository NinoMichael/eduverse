export interface LicenseData {
	privateKey: string;
	activatedAt: string;
}

export interface ActivationResponse {
	success: boolean;
	message: string;
	license?: LicenseData;
}

class ActivationService {
	private readonly PUBLIC_KEY = "EDUVERSE-LICENSE-2024";
	private readonly VALID_KEYS = [
		"DEMO-2024-ABCD",
		"TEST-KEY-1234",
		"EDUVERSE-PRO-2024",
	];

	private generateSignature(privateKey: string): string {
		const combined = `${this.PUBLIC_KEY}:${privateKey}`;
		let hash = 0;
		for (let i = 0; i < combined.length; i++) {
			const char = combined.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
	}

	private isValidKey(privateKey: string): boolean {
		return this.VALID_KEYS.includes(privateKey.trim());
	}

	async activate(privateKey: string): Promise<ActivationResponse> {
		if (!privateKey.trim()) {
			return {
				success: false,
				message: "Veuillez saisir votre clé privée",
			};
		}

		const trimmedKey = privateKey.trim();

		if (!this.isValidKey(trimmedKey)) {
			return {
				success: false,
				message: "Clé d'activation invalide",
			};
		}

		const licenseData: LicenseData = {
			privateKey: trimmedKey,
			activatedAt: new Date().toISOString(),
		};

		const signature = this.generateSignature(trimmedKey);
		localStorage.setItem("eduverse_license", JSON.stringify(licenseData));
		localStorage.setItem("eduverse_license_signature", signature);

		return {
			success: true,
			message: "Activation réussie",
			license: licenseData,
		};
	}

	getLicense(): LicenseData | null {
		const stored = localStorage.getItem("eduverse_license");
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				return null;
			}
		}
		return null;
	}

	isActivated(): boolean {
		return this.getLicense() !== null;
	}

	deactivate(): void {
		localStorage.removeItem("eduverse_license");
		localStorage.removeItem("eduverse_license_signature");
	}
}

export const activationService = new ActivationService();
