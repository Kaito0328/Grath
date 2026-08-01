"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useState } from "react";
import { Select } from "../../../design/baseComponents/Select";
import { Text } from "../../../design/baseComponents/Text";
import { OperationNotebookLayout } from "../../../shared/layouts/OperationNotebookLayout";
import { View } from "../../../design/primitives/View";

import { ComplexBinaryOperation } from "./complex-binary/ComplexBinaryOperation";
type ComplexOperationKey = "complex.add" | "complex.sub" | "complex.mul";


const operations: Array<{ key: ComplexOperationKey; label: string; description: string }> = [
	{ key: "complex.add", label: "加算", description: "文字式 E₁, E₂ の二項演算です。" },
	{ key: "complex.sub", label: "減算", description: "文字式 E₁, E₂ の二項演算です。" },
	{ key: "complex.mul", label: "乗算", description: "文字式 E₁, E₂ の二項演算です。" },
];

export interface ComplexOperationsProps {
	title?: string;
}

export const ComplexOperations = ({ title = "演算の設定" }: ComplexOperationsProps) => {
	const [selected, setSelected] = useState<ComplexOperationKey>("complex.add");
	const selectedOp = operations.find((o) => o.key === selected);

	const settingBlock = (
		<Stack gap={"sm"}>
			<Text weight="semibold" variant="detail">{title}</Text>
			<View className="flex flex-col gap-2 md:flex-row md:items-center">
				<Text className="md:min-w-[160px]">・演算</Text>
				<Select
					value={selected}
					onChange={(e) => setSelected(e.target.value as ComplexOperationKey)}
					className="w-full md:w-64"
					options={operations.map((o) => ({ value: o.key, label: o.label }))}
				/>
			</View>
			{selectedOp && <Text className="text-muted-foreground">{selectedOp.description}</Text>}
		</Stack>
	);

	const operationFlow =
		selected === "complex.add" ? (
			<ComplexBinaryOperation op="add" startIndex={2} />
		) : selected === "complex.sub" ? (
			<ComplexBinaryOperation op="sub" startIndex={2} />
		) : (
			<ComplexBinaryOperation op="mul" startIndex={2} />
		);

	return (
		<Stack gap={"lg"}>
			<OperationNotebookLayout setting={settingBlock} />
			{operationFlow}
		</Stack>
	);
};
