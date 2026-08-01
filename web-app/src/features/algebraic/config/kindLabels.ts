import type { KindLabelMap } from "../../../shared/kinds/kindLabels";
import { AlgebraicTypeLabels } from "../shared/typeLabels";

export const algebraicKindLabelMap: KindLabelMap = {
	"algebraic.rational": {
		symbol: "r",
		en: AlgebraicTypeLabels.rational.en,
		ja: AlgebraicTypeLabels.rational.ja,
	},
	"algebraic.symbolicComplex": {
		symbol: "E",
		en: AlgebraicTypeLabels.expr.en,
		ja: "記号式",
	},
};

