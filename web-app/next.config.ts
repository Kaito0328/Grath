import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@my-project/client-sdk", "wasm-lib"],
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config) => {
		config.experiments = {
			...(config.experiments || {}),
			asyncWebAssembly: true,
		};

		config.module.rules.push({
			test: /\.wasm$/,
			type: "webassembly/async",
		});

		config.output.environment = {
			...(config.output.environment || {}),
			asyncFunction: true,
		};

		return config;
	},
};

export default nextConfig;

