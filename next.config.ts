import { generateCoCHash } from "@/actions/generateCoCHash";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_DEFAULT_SIGNATURE_MESSAGE_SUFFIX: generateCoCHash(),
	},
};

export default nextConfig;
