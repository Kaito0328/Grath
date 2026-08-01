"use client";
import React, { useState, useEffect } from "react";
import { Input } from "../../../design/baseComponents/Input";
import { View } from "../../../design/primitives/View";
import { Stack } from "../../../design/primitives/Stack";
import { Divider } from "../../../design/baseComponents/Divider";
import { NumberInput } from "../../../design/baseComponents/NumberInput";

import { LinalgCoeffType } from "../LinalgOperations";

interface MatrixCellProps {
    value: string;
    onChange: (value: string) => void;
    coeffType: LinalgCoeffType;
}

export const MatrixCell = ({ value, onChange, coeffType }: MatrixCellProps) => {
    const [numer, setNumer] = useState<string>("");
    const [denom, setDenom] = useState<string>("");

    useEffect(() => {
        if (coeffType === "rational") {
            if (value.includes("/")) {
                const parts = value.split("/");
                if (parts.length === 2) {
                    setNumer(parts[0].trim());
                    setDenom(parts[1].trim());
                }
            } else {
                setNumer(value || "0");
                setDenom("1");
            }
        }
    }, [value, coeffType]);

    const handleNumerChange = (val: number | null) => {
        const newNumer = val?.toString() || "0";
        setNumer(newNumer);
        onChange(`${newNumer}/${denom}`);
    };

    const handleDenomChange = (val: number | null) => {
        const newDenom = val?.toString() || "1";
        setDenom(newDenom);
        onChange(`${numer}/${newDenom}`);
    };

    if (coeffType === "numeric") {
        return (
            <View className="min-w-[120px]">
                <NumberInput
                    value={parseFloat(value) || 0}
                    onChangeNumber={(val) => onChange(val?.toString() || "0")}
                    className="text-left w-full h-full font-mono text-sm"
                    placeholder="0"
                />
            </View>
        );
    }

    if (coeffType === "rational") {
        return (
            <View className="min-w-[120px]">
                <Stack gap="xs" className="p-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-inner">
                    <NumberInput
                        value={parseInt(numer) || 0}
                        onChangeNumber={handleNumerChange}
                        className="h-7 text-xs text-center border-none focus:ring-0"
                        allowFloat={false}
                        placeholder="分子"
                    />
                    <Divider className="my-0" />
                    <NumberInput
                        value={parseInt(denom) || 1}
                        onChangeNumber={handleDenomChange}
                        className="h-7 text-xs text-center border-none focus:ring-0"
                        allowFloat={false}
                        placeholder="分母"
                    />
                </Stack>
            </View>
        );
    }

    // symbolic
    return (
        <View className="min-w-[120px]">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-left w-full h-full font-mono text-sm"
                placeholder="x + 1"
            />
        </View>
    );
};
