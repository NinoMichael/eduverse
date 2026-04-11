export const isRunningInTauri = (): boolean => {
	try {
		return typeof window !== "undefined" && "__TAURI__" in window;
	} catch {
		return false;
	}
};

export const STORAGE_KEYS = {
	LICENSE: "eduverse_license",
	LICENSE_SIGNATURE: "eduverse_license_signature",
	TOKEN: "eduverse_token",
	SETUP_COMPLETE: "eduverse_setup_complete",
	DB_PREFIX: "eduverse_db_",
} as const;

export class LocalStorageDB {
	private prefix: string;

	constructor(prefix = STORAGE_KEYS.DB_PREFIX) {
		this.prefix = prefix;
	}

	private getKey(key: string): string {
		return `${this.prefix}${key}`;
	}

	get<T>(key: string, defaultValue: T | null = null): T | null {
		try {
			const item = localStorage.getItem(this.getKey(key));
			if (item === null) return defaultValue;
			return JSON.parse(item) as T;
		} catch {
			return defaultValue;
		}
	}

	set<T>(key: string, value: T): void {
		localStorage.setItem(this.getKey(key), JSON.stringify(value));
	}

	remove(key: string): void {
		localStorage.removeItem(this.getKey(key));
	}

	clear(): void {
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.prefix)) {
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach((key) => localStorage.removeItem(key));
	}

	getAll<T>(pattern?: string): T[] {
		const results: T[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.prefix)) {
				if (!pattern || key.includes(pattern)) {
					const item = localStorage.getItem(key);
					if (item) {
						try {
							results.push(JSON.parse(item) as T);
						} catch {
							// skip invalid JSON
						}
					}
				}
			}
		}
		return results;
	}
}

export const db = new LocalStorageDB();
