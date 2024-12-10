export const config = {
	signature: {
		messageSuffix:
			process.env.NEXT_PUBLIC_SIGNATURE_MESSAGE_SUFFIX ||
			process.env.NEXT_PUBLIC_DEFAULT_SIGNATURE_MESSAGE_SUFFIX ||
			"HYPERQUBE LAUNCH",
	},
} as const;
