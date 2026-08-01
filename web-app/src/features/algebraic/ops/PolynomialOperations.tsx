"use client";
import { Stack } from "../../../design/primitives/Stack";
import { useState } from "react";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Select } from "../../../design/baseComponents/Select";
import { Text } from "../../../design/baseComponents/Text";
import { Button } from "../../../design/baseComponents/Button";
import { OperationNotebookLayout } from "../../../shared/layouts/OperationNotebookLayout";
import { View } from "../../../design/primitives/View";

import { PolynomialSolverOperation } from "./polynomial/PolynomialSolverOperation";

export type PolyOpMode = "solve" | "add" | "sub" | "mul" | "div";
export type PolyCoeffType = "numeric" | "rational" | "symbolic";
export type PolyGroupKey = "unary" | "binary";

export interface PolynomialOperationsProps {
    forcedGroup?: PolyGroupKey;
}

const operationsByGroup: Record<
    PolyGroupKey,
    Array<{ key: PolyOpMode; label: string; description: string }>
> = {
    unary: [
        { key: "solve", label: "方程式の解", description: "多項式の根（方程式の解）を求めます。" },
    ],
    binary: [
        { key: "add", label: "加算", description: "多項式同士を加算します。" },
        { key: "sub", label: "減算", description: "多項式同士を減算します。" },
        { key: "mul", label: "乗算", description: "多項式同士を乗算します。" },
        { key: "div", label: "除算", description: "多項式同士を除算します。" },
    ],
};

const getGroupButtons = (coeffType: PolyCoeffType) => [
    { key: "unary", labelMarkdown: "単項 ($P(x) = 0$)", disabled: coeffType === "symbolic" },
    { key: "binary", labelMarkdown: "二項 ($P(x) \\circ Q(x)$)", disabled: false },
] as const;

export const PolynomialOperations = ({ forcedGroup }: PolynomialOperationsProps) => {
    const [group, setGroup] = useState<PolyGroupKey>(forcedGroup ?? "unary");
    const [selectedByGroup, setSelectedByGroup] = useState<
        Record<PolyGroupKey, PolyOpMode>
    >({
        unary: "solve",
        binary: "add",
    });
    const activeGroup = forcedGroup ?? group;

    const [coeffType, setCoeffType] = useState<PolyCoeffType>("numeric");

    const handleCoeffTypeChange = (newType: PolyCoeffType) => {
        const normalizedType = forcedGroup === "unary" && newType === "symbolic" ? "numeric" : newType;
        setCoeffType(normalizedType);
        if (!forcedGroup && normalizedType === "symbolic" && activeGroup === "unary") {
            setGroup("binary");
        }
    };

    const selected = selectedByGroup[activeGroup];
    const operations = operationsByGroup[activeGroup];
    const selectedOp = operations.find((o) => o.key === selected);
    const coeffOptions = [
        { value: "numeric", label: "数値 (Numeric)" },
        { value: "rational", label: "有理数 (Rational)" },
        { value: "symbolic", label: "記号表示 (Symbolic)" },
    ].filter((option) => !(forcedGroup === "unary" && option.value === "symbolic"));

    const settingBlock = (
        <Stack gap={"sm"}>
            <Text weight="semibold" variant="detail">多項式オペレーション</Text>
            <View className="flex flex-col gap-2 md:flex-row md:items-center">
                <Text className="md:min-w-[160px]">・係数の種類</Text>
                <Select
                    value={coeffType}
                    onChange={(e) => handleCoeffTypeChange(e.target.value as PolyCoeffType)}
                    className="w-full md:w-64"
                    options={coeffOptions}
                />
            </View>

            {!forcedGroup ? (
                <View className="mt-4 flex flex-col gap-2 md:flex-row md:items-start">
                    <Text className="md:min-w-[160px] md:pt-1">・入力構成</Text>
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
                <Text className="md:min-w-[160px]">・演算</Text>
                <Select
                    value={selected}
                    onChange={(e) =>
                        setSelectedByGroup((prev) => ({
                            ...prev,
                            [activeGroup]: e.target.value as PolyOpMode,
                        }))
                    }
                    className="w-full md:w-64"
                    options={operations.map((o) => ({ value: o.key, label: o.label }))}
                />
            </View>

            {selectedOp && <Text className="text-muted-foreground">{selectedOp.description}</Text>}
        </Stack>
    );

    const operationFlow = <PolynomialSolverOperation mode={selected} coeffType={coeffType} startIndex={2} />;

    return (
        <Stack gap={"lg"}>
            <OperationNotebookLayout setting={settingBlock} />
            <View>{operationFlow}</View>
        </Stack>
    );
};
