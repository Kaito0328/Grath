// Centralized route definitions (avoid hard-coded href strings across the app).

export const routes = {
	home: "/",
	signalProcessing: {
		root: "/signal-processing",
		convolution: "/signal-processing/convolution",
		sampling: "/signal-processing/sampling",
		spectrum: "/signal-processing/spectrum",
		aliasing: "/signal-processing/aliasing",
		filter: "/signal-processing/filter",
		iir: "/signal-processing/iir",
	},
	algebraic: {
		root: "/algebraic",
		expr: "/algebraic/expr",
		rational: "/algebraic/rational",
	},
	polynomial: {
		root: "/polynomial",
		solver: "/polynomial/solver",
		binary: "/polynomial/binary",
	},
	linalg: {
		root: "/linalg",
		unary: "/linalg/unary",
		binary: "/linalg/binary",
		vector: "/linalg/vector",
	},
	coding: {
		root: "/coding",
		source: "/coding/source",
		channel: "/coding/channel",
		comm: "/coding/comm",
		gf2: "/coding/gf2",
	},
	finiteField: {
		root: "/finite-field",
		gfp5: "/finite-field/gfp5",
		gf256: "/finite-field/gf256",
	},
	concreteMath: {
		root: "/concrete-math",
		recurrence: "/concrete-math/recurrence",
		finiteCalculus: "/concrete-math/finite-calculus",
		summation: "/concrete-math/summation",
		numberTheory: "/concrete-math/number-theory",
		specialFunctions: "/concrete-math/special-functions",
	},
	statistics: {
		root: "/statistics",
		workshop: "/statistics/workshop",
		testing: "/statistics/testing",
		distributions: "/statistics/distributions",
		correlation: "/statistics/correlation",
		gof: "/statistics/gof",
		regression: "/statistics/regression",
	},
} as const;
