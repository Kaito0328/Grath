"use client";
import { Stack } from "../../design/primitives/Stack";
import { useEffect, useState } from "react";
import { Markdown } from "../../design/baseComponents/Markdown";
import { Select } from "../../design/baseComponents/Select";
import { Text } from "../../design/baseComponents/Text";
import { Button } from "../../design/baseComponents/Button";
import { View } from "../../design/primitives/View";
import { Flex } from "../../design/primitives/Flex";
import { OperationNotebookLayout } from "../../shared/layouts/OperationNotebookLayout";

import { LinalgSolverOperation } from "./ops/LinalgSolverOperation";
import { LinalgVectorOperation, type LinalgVectorOpMode } from "./ops/LinalgVectorOperation";

export type LinalgOpMode = "inv" | "eigenvalues" | "lu" | "qr" | "svd" | "add" | "mul" | LinalgVectorOpMode;
export type LinalgCoeffType = "numeric" | "rational" | "symbolic";
export type LinalgGroupKey = "unary" | "binary" | "vector";

export interface LinalgOperationsProps {
    forcedGroup?: LinalgGroupKey;
}

const operationsByGroup: Record<
    LinalgGroupKey,
    Array<{ key: LinalgOpMode; label: string; description: string }>
> = {
    unary: [
        { key: "inv", label: "逆行列", description: "逆行列を計算します。" },
        { key: "eigenvalues", label: "固有値分解", description: "固有値・固有ベクトルを計算します。" },
        { key: "lu", label: "LU分解", description: "行列を下三角行列 L と上三角行列 U に分解します。" },
        { key: "qr", label: "QR分解", description: "行列を直交行列 Q と上三角行列 R に分解します。" },
        { key: "svd", label: "特異値分解 (SVD)", description: "行列を特異値分解します。" },
    ],
    binary: [
        { key: "add", label: "加算", description: "行列同士を加算します。" },
        { key: "mul", label: "乗算", description: "行列同士を乗算します。" },
    ],
	vector: [
		{ key: "mulVec", label: "行列×ベクトル", description: "行列 $A$ とベクトル $v$ の積 $Av$ を計算します。" },
		{ key: "solve", label: "連立一次方程式", description: "連立一次方程式 $Ax=b$ を解きます（記号モードは未対応）。" },
	],
};

const getGroupButtons = (coeffType: LinalgCoeffType) => [
    { key: "unary", labelMarkdown: "単項演算 ($A^{-1}$, $\\det$など)", disabled: false },
    { key: "binary", labelMarkdown: "二項演算 ($A \\circ B$)", disabled: false },
	{ key: "vector", labelMarkdown: "ベクトル演算 ($Av$, $Ax=b$)", disabled: false },
] as const;

export const LinalgOperations = ({ forcedGroup }: LinalgOperationsProps) => {
    const [group, setGroup] = useState<LinalgGroupKey>(forcedGroup ?? "unary");
    const [selectedByGroup, setSelectedByGroup] = useState<
        Record<LinalgGroupKey, LinalgOpMode>
    >({
        unary: "inv",
        binary: "add",
		vector: "mulVec",
    });

    const activeGroup = forcedGroup ?? group;

    const [coeffType, setCoeffType] = useState<LinalgCoeffType>("numeric");

    useEffect(() => {
        if (forcedGroup) {
            setGroup(forcedGroup);
        }
    }, [forcedGroup]);

    const handleCoeffTypeChange = (newType: LinalgCoeffType) => {
        setCoeffType(newType);
    };

    const selected = selectedByGroup[activeGroup];
    const operations = operationsByGroup[activeGroup];
    const selectedOp = operations.find((o) => o.key === selected);

    const settingBlock = (
        <Stack gap={"sm"}>
            <View className="flex flex-col gap-2 md:flex-row md:items-center">
                <Text className="md:min-w-[180px]">・要素の種類</Text>
                <Select
                    value={coeffType}
                    onChange={(e) => handleCoeffTypeChange(e.target.value as LinalgCoeffType)}
                    className="w-full md:w-64"
                    options={[
                        { value: "numeric", label: "数値 (Numeric)" },
                        { value: "rational", label: "有理数 (Rational)" },
                        { value: "symbolic", label: "記号表示 (Symbolic)" },
                    ]}
                />
            </View>

            {!forcedGroup ? (
                <View className="mt-4 flex flex-col gap-2 md:flex-row md:items-start">
                    <Text className="md:min-w-[180px] md:pt-1">・入力構成</Text>
                    <Stack direction="row" gap={"sm"} className="flex-wrap md:flex-1">
                        {getGroupButtons(coeffType).map((button) => {
                            if (button.disabled) return null;
                            const isSelected = activeGroup === button.key;
                            return (
                                <Button
                                    key={button.key}
                                    type="button"
                                    size="sm"
                                    color={isSelected ? "primary" : "secondary"}
                                    variant={isSelected ? "solid" : "outline"}
                                    aria-pressed={isSelected}
                                    onClick={() => setGroup(button.key)}
                                >
                                    <Markdown>{button.labelMarkdown}</Markdown>
                                </Button>
                            );
                        })}
                    </Stack>
                </View>
            ) : null}

            <View className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
                <Text className="md:min-w-[180px]">・演算</Text>
                <Select
                    value={selected}
                    onChange={(e) =>
                        setSelectedByGroup((prev) => ({
                            ...prev,
                            [activeGroup]: e.target.value as LinalgOpMode,
                        }))
                    }
                    className="w-full md:w-64"
                    options={operations.map((o) => ({ value: o.key, label: o.label }))}
                />
            </View>

            {selectedOp && (
                <Flex>
                    <Text className="text-muted-foreground">{selectedOp.description}</Text>
                </Flex>
            )}
        </Stack>
    );

    const operationFlow = (
        <View>
            {activeGroup === "vector" ? (
                <LinalgVectorOperation mode={selected as LinalgVectorOpMode} coeffType={coeffType} startIndex={2} />
            ) : (
                <LinalgSolverOperation
                    mode={selected as Exclude<LinalgOpMode, LinalgVectorOpMode>}
                    coeffType={coeffType}
                    group={activeGroup}
                    startIndex={2}
                />
            )}
        </View>
    );

    return (
        <Stack gap={"lg"}>
            <OperationNotebookLayout setting={settingBlock} />
            {operationFlow}
        </Stack>
    );
};
