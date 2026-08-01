"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useState } from "react";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Select } from "../../../design/baseComponents/Select";
import { Text } from "../../../design/baseComponents/Text";
import { OperationNotebookLayout } from "../../../shared/layouts/OperationNotebookLayout";
import { View } from "../../../design/primitives/View";

import { RationalSimplifyOperation } from "./rational/RationalSimplifyOperation";
import { RationalBinaryOperation } from "./rational/RationalBinaryOperation";
import { Button } from "../../../design/baseComponents/Button";
type RationalOperationKey =
	| "rational.simplify"
	| "rational.add"
	| "rational.mul"
	| "rational.div";

type RationalOperationGroupKey = "unary" | "binary";


const operationsByGroup: Record<
	RationalOperationGroupKey,
	Array<{ key: RationalOperationKey; label: string; description: string }>
> = {
	unary: [{ key: "rational.simplify", label: "簡約", description: "有理数を簡約します。" }],
	binary: [
		{ key: "rational.add", label: "加算", description: "有理数の二項演算です。" },
		{ key: "rational.mul", label: "乗算", description: "有理数の二項演算です。" },
		{ key: "rational.div", label: "除算", description: "有理数の二項演算です。" },
	],
};

const groupButtons: Array<{ key: RationalOperationGroupKey; labelMarkdown: string }> = [
	{ key: "unary", labelMarkdown: "単項 ($r$)" },
	{ key: "binary", labelMarkdown: "二項 ($r \\times r$)" },
];

export interface RationalOperationsProps {
	title?: string;
}

export const RationalOperations = ({ title = "演算の設定" }: RationalOperationsProps) => {
	const [group, setGroup] = useState<RationalOperationGroupKey>("unary");
	const [selectedByGroup, setSelectedByGroup] = useState<
		Record<RationalOperationGroupKey, RationalOperationKey>
	>({
		unary: "rational.simplify",
		binary: "rational.add",
	});

	const selected = selectedByGroup[group];
	const operations = operationsByGroup[group];
	const selectedOp = operations.find((o) => o.key === selected);

	const settingBlock = (
		<Stack gap={"sm"}>
			<Text weight="semibold" variant="detail">{title}</Text>
			<View className="flex flex-col gap-2 md:flex-row md:items-start">
				<Text className="md:min-w-[160px] md:pt-1">・入力構成</Text>
				<Stack direction="row" gap={"sm"} className="flex-wrap md:flex-1">
					{groupButtons.map((b) => {
						const isSelected = group === b.key;
						return (
							<Button
								key={b.key}
								type="button"
								size="sm"
								color={isSelected ? "primary" : "secondary"}
								variant={isSelected ? "solid" : "outline"}
								aria-pressed={isSelected}
								onClick={() => setGroup(b.key)}
							>
								<Markdown>{b.labelMarkdown}</Markdown>
							</Button>
						);
					})}
				</Stack>
			</View>

			<View className="flex flex-col gap-2 md:flex-row md:items-center">
				<Text className="md:min-w-[160px]">・演算</Text>
				<Select
					value={selected}
					onChange={(e) =>
						setSelectedByGroup((prev) => ({
							...prev,
							[group]: e.target.value as RationalOperationKey,
						}))
					}
					className="w-full md:w-64"
					options={operations.map((o) => ({ value: o.key, label: o.label }))}
				/>
			</View>
			{selectedOp && <Text className="text-muted-foreground">{selectedOp.description}</Text>}
		</Stack>
	);

	const operationFlow =
		selected === "rational.simplify" ? (
			<RationalSimplifyOperation startIndex={2} />
		) : selected === "rational.add" ? (
			<RationalBinaryOperation op="add" startIndex={2} />
		) : selected === "rational.mul" ? (
			<RationalBinaryOperation op="mul" startIndex={2} />
		) : (
			<RationalBinaryOperation op="div" startIndex={2} />
		);

	return (
		<Stack gap={"lg"}>
			<OperationNotebookLayout setting={settingBlock} />
			<View>{operationFlow}</View>
		</Stack>
	);
};
