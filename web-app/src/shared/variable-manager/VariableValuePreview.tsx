"use client";

import { RationalOutput } from "../../features/algebraic/types/RationalOutput";
import { SymbolicComplexOutput } from "../../features/algebraic/types/SymbolicComplexOutput";
import { Text } from "../../design/baseComponents/Text";
import { View } from "../../design/primitives/View";

export interface VariableValuePreviewProps {
	kind: string;
	value: string;
	latex?: string;
}

export const VariableValuePreview = ({ kind, value, latex }: VariableValuePreviewProps) => {
	const common = {
		value,
		latex: latex ?? null,
		onRequestSave: undefined,
		showActions: false,
		frame: false,
		emptyText: "LaTeXが未保存です。",
	} as const;

	if (kind === "algebraic.rational") return <RationalOutput {...common} />;
	if (kind === "algebraic.symbolicComplex") return <SymbolicComplexOutput {...common} />;

	if (kind === "statistics.sample") return <Text className="font-mono text-xs">{value}</Text>;
	if (kind === "statistics.result" || kind === "signalProcessing.signal") {
		try {
			// JSON形式なら整形
			const obj = JSON.parse(value);
			return (
				<View bg="muted" padding="sm" rounded="sm">
					<pre className="text-[10px] overflow-auto max-h-32">
						{JSON.stringify(obj, null, 2)}
					</pre>
				</View>
			);
		} catch {
			return <Text className="font-mono text-xs">{value}</Text>;
		}
	}

	// 未知のkindはプレーン表示（Outputコンポーネントが無い）
	return (
		<Text className="whitespace-pre-wrap break-words">
			{value}
		</Text>
	);
};
