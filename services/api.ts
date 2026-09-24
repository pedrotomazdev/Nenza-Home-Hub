declare global {
	interface Window {
		NENZA_CONFIG?: {
			API_URL?: string;
		};
	}
}

export const API_URL =
	typeof window !== "undefined" ? window.NENZA_CONFIG?.API_URL || "" : "";