// Human-facing labels (JA/EN) for top-level features.
// Keep these out of logic so renames are localized.

export const featureLabels = {
	signalProcessing: {
		en: "Signal Processing",
		ja: "信号処理",
	},
	algebraic: {
		en: "Algebraic",
		ja: "代数",
	},
	polynomial: {
		en: "Polynomial",
		ja: "多項式",
	},
	linalg: {
		en: "Linear Algebra",
		ja: "線形代数",
	},
	coding: {
		en: "Coding",
		ja: "符号理論",
	},
	codingSource: {
		en: "Source",
		ja: "情報源符号化",
	},
	codingChannel: {
		en: "Channel",
		ja: "通信路符号化",
	},
	codingComm: {
		en: "Comm (E2E)",
		ja: "E2E通信シミュレーション",
	},
	codingGf2: {
		en: "GF(2) Tools",
		ja: "GF(2) 解析",
	},
	concreteMath: {
		en: "Discrete Math",
		ja: "離散数学",
	},
	finiteField: {
		en: "Finite Field",
		ja: "有限体",
	},
	statistics: {
		en: "Statistics",
		ja: "統計解析",
	},
} as const;
