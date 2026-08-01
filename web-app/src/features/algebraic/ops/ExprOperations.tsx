"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useState } from "react";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Select } from "../../../design/baseComponents/Select";
import { Text } from "../../../design/baseComponents/Text";
import { OperationNotebookLayout } from "../../../shared/layouts/OperationNotebookLayout";
import { View } from "../../../design/primitives/View";

import { SimplifyOperation } from "./simplify/SimplifyOperation";
import { ExprBinaryOperation } from "./expr-binary/ExprBinaryOperation";
import { Button } from "../../../design/baseComponents/Button";

type ExprOperationKey = "expr.simplify" | "expr.add" | "expr.mul";
type ExprOperationGroupKey = "unary" | "binary";

const operationsByGroup: Record<
    ExprOperationGroupKey,
    Array<{ key: ExprOperationKey; label: string; description: string }>
> = {
    unary: [{ key: "expr.simplify", label: "簡約", description: "式を簡約します。" }],
    binary: [
        { key: "expr.add", label: "加算", description: "式の二項演算です。" },
        { key: "expr.mul", label: "乗算", description: "式の二項演算です。" },
    ],
};

const groupButtons: Array<{ key: ExprOperationGroupKey; labelMarkdown: string }> = [
    { key: "unary", labelMarkdown: "単項 ($E$)" },
    { key: "binary", labelMarkdown: "二項 ($E \\times E$)" },
];

export interface ExprOperationsProps {
    title?: string;
}

export const ExprOperations = ({ title = "演算の設定" }: ExprOperationsProps) => {
    const [group, setGroup] = useState<ExprOperationGroupKey>("unary");
    const [selectedByGroup, setSelectedByGroup] = useState<
        Record<ExprOperationGroupKey, ExprOperationKey>
    >({
        unary: "expr.simplify",
        binary: "expr.add",
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
                            [group]: e.target.value as ExprOperationKey,
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
        selected === "expr.simplify" ? (
            <SimplifyOperation startIndex={2} />
        ) : selected === "expr.add" ? (
            <ExprBinaryOperation op="add" startIndex={2} />
        ) : (
            <ExprBinaryOperation op="mul" startIndex={2} />
        );

    return (
        <Stack gap={"lg"}>
            <OperationNotebookLayout setting={settingBlock} />
            <View>{operationFlow}</View>
        </Stack>
    );
};
