"use client";
import { Stack } from "../../../design/primitives/Stack";
import { useState, useEffect } from "react";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { View } from "../../../design/primitives/View";
import { Button } from "../../../design/baseComponents/Button";
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { Input } from "../../../design/baseComponents/Input";
import { Flex } from "../../../design/primitives/Flex";
import { Select } from "../../../design/baseComponents/Select";
import {
    ConcreteMathHelper
} from "@my-project/client-sdk/api/concreteMath";
import type { RationalDTO as RationalDto, SymbolicExprDTO as SymbolicExprDto } from "@my-project/client-sdk/api/algebraicDtoApi";
import { SymbolicExpr } from "@my-project/client-sdk/api/algebraicApi";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SymbolicExprOutput } from "../../algebraic/types/SymbolicExprOutput";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../stores/variableManager/types";

type SumType = "arithmetic" | "geometric" | "arithGeom";
type SpecialNumberType = "stirling1" | "stirling2" | "bernoulli" | "harmonic";

export const SummationOperation = () => {
    // Sum States
    const [sumType, setSumType] = useState<SumType>("geometric");
    const [a0, setA0] = useState<string>("1");
    const [d, setD] = useState<string>("1");
    const [r, setR] = useState<string>("r");
    const [n, setN] = useState<string>("n");

    const [sumResult, setSumResult] = useState<string | null>(null);
    const [sumSymbolic, setSumSymbolic] = useState<SymbolicExpr | null>(null);

    // Special Number States
    const [numType, setNumType] = useState<SpecialNumberType>("bernoulli");
    const [numN, setNumN] = useState<number>(0);
    const [numK, setNumK] = useState<number>(0);
    const [numRes, setNumRes] = useState<number | null>(null);

    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ value: string; latex?: string; kind: VariableKind } | null>(null);

    const toExpr = (raw: string): SymbolicExprDto => {
        const text = (raw ?? "").trim() || "0";

        const toRationalDto = (input: string): RationalDto => {
            const safe = (input ?? "").trim() || "0";
            const [numerRaw, denomRaw] = safe.split("/", 2);
            const numer = (numerRaw ?? "").trim() || "0";
            const denom = (denomRaw ?? "").trim() || "1";
            return { numer, denom, dirty: false };
        };

        // Basic parser for rational or simple symbolic
        if (text.includes("/")) {
            return { kind: "Rational", value: toRationalDto(text) };
        }
        // Fallback to a symbolic atom if it looks like a variable
        if (/^[a-zA-Z]$/.test(text)) {
            return { kind: "Symbol", value: text };
        }
        // Default to integer (as rational)
        const val = parseInt(text);
        if (!isNaN(val)) return { kind: "Rational", value: { numer: val.toString(), denom: "1", dirty: false } };
        // Complex fallback
        return { kind: "Symbol", value: text };
    };

    async function onCalculateSum() {
        setBusy(true);
        setSumResult(null);
        setSumSymbolic(null);
        try {
            let resDto: SymbolicExprDto;
            const nExpr = toExpr(n);
            if (sumType === "geometric") {
                resDto = await ConcreteMathHelper.geometricSum(toExpr(r), nExpr);
            } else if (sumType === "arithmetic") {
                resDto = await ConcreteMathHelper.arithmeticSum(toExpr(a0), toExpr(d), nExpr);
            } else {
                resDto = await ConcreteMathHelper.arithGeomSum(toExpr(a0), toExpr(d), toExpr(r), nExpr);
            }
            const res = SymbolicExpr.fromDTO(resDto);
            setSumSymbolic(res);
            setSumResult(await res.toLatex());
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    async function onCalculateSpecial() {
        let val: number;
        if (numType === "stirling1") val = await ConcreteMathHelper.getStirling1(numN, numK);
        else if (numType === "stirling2") val = await ConcreteMathHelper.getStirling2(numN, numK);
        else if (numType === "bernoulli") val = await ConcreteMathHelper.getBernoulli(numN);
        else val = await ConcreteMathHelper.getHarmonic(numN);
        setNumRes(val);
    }

    const sumInput = (
        <Stack gap="lg">
            <Stack gap="xs">
                <Text variant="xs" weight="semibold" color="secondary">和の種類</Text>
                <Select
                    value={sumType}
                    onChange={(e) => setSumType(e.target.value as SumType)}
                    options={[
                        { value: "arithmetic", label: "等差級数 (Arithmetic)" },
                        { value: "geometric", label: "等比級数 (Geometric)" },
                        { value: "arithGeom", label: "等差等比級数 (Arith-Geom)" },
                    ]}
                />
            </Stack>

            <Flex gap="md" wrap={true}>
                {(sumType === "arithmetic" || sumType === "arithGeom") && (
                    <>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">初項 a₀</Text>
                            <Input className="w-24 h-10 px-3" value={a0} onChange={(e) => setA0(e.target.value)} />
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">公差 d</Text>
                            <Input className="w-24 h-10 px-3" value={d} onChange={(e) => setD(e.target.value)} />
                        </Stack>
                    </>
                )}
                {(sumType === "geometric" || sumType === "arithGeom") && (
                    <Stack gap="xs">
                        <Text variant="xs" weight="semibold" color="secondary">公比 r</Text>
                        <Input className="w-24 h-10 px-3" value={r} onChange={(e) => setR(e.target.value)} />
                    </Stack>
                )}
                <Stack gap="xs">
                    <Text variant="xs" weight="semibold" color="secondary">項数 (上限 n)</Text>
                    <Input className="w-24 h-10 px-3" value={n} onChange={(e) => setN(e.target.value)} />
                </Stack>
            </Flex>
            <Button onClick={onCalculateSum} loading={busy} size="lg" className="w-full">
                記号的な和を求める
            </Button>
        </Stack>
    );

    const sumOutput = sumResult ? (
        <SymbolicExprOutput
            label={<Text variant="h3" weight="bold">和の閉じた式</Text>}
            value={sumSymbolic?.toString() ?? sumResult}
            latex={sumResult}
                onRequestSave={(args) => setPendingSave({ ...args, kind: "algebraic.symbolicComplex" })}
        />
    ) : null;

    return (
        <Stack gap="xl">
            <View bg="muted" padding="lg" rounded="lg">
                <Text weight="bold" variant="body" className="mb-3">数列の和 (Symbolic Sums)</Text>
                <UnaryOperationLayout
                    input={sumInput}
                    action={<View />} // Handled internally
                    output={sumOutput}
                />
            </View>

            <View bg="muted" padding="lg" rounded="lg" className="border border-slate-200 dark:border-slate-800">
                <Text weight="bold" variant="body" className="mb-3">特殊な数 (Special Numbers)</Text>
                <Stack gap="md">
                    <Flex gap="md" align="end" wrap={true}>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">種類</Text>
                            <Select
                                value={numType}
                                onChange={(e) => setNumType(e.target.value as SpecialNumberType)}
                                options={[
                                    { value: "bernoulli", label: "ベルヌーイ数 Bₙ" },
                                    { value: "stirling1", label: "第1種スターリング数 [n, k]" },
                                    { value: "stirling2", label: "第2種スターリング数 {n, k}" },
                                    { value: "harmonic", label: "調和数 Hₙ" },
                                ]}
                            />
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">n</Text>
                            <NumberInput value={numN} onChangeNumber={v => setNumN(v ?? 0)} className="w-20" />
                        </Stack>
                        {(numType === "stirling1" || numType === "stirling2") && (
                            <Stack gap="xs">
                                <Text variant="xs" weight="semibold" color="secondary">k</Text>
                                <NumberInput value={numK} onChangeNumber={v => setNumK(v ?? 0)} className="w-20" />
                            </Stack>
                        )}
                        <Button color="secondary" onClick={onCalculateSpecial}>計算</Button>
                    </Flex>

                    {numRes !== null && (
                        <View bg="card" padding="md" rounded="lg" className="border flex justify-between items-center">
                            <Text variant="detail" weight="bold">
                                {numType === "bernoulli" ? `B_{${numN}}` :
                                    numType === "harmonic" ? `H_{${numN}}` :
                                        numType === "stirling1" ? `[${numN}, ${numK}]` : `{${numN}, ${numK}}`}
                            </Text>
                            <Text variant="h2" color="primary" className="font-mono">{numRes.toString()}</Text>
                        </View>
                    )}
                </Stack>
            </View>

            {pendingSave && (
                <SaveVariableModal
                    open={!!pendingSave}
                    onClose={() => setPendingSave(null)}
                    kind={pendingSave.kind}
                    value={pendingSave.value}
                    latex={pendingSave.latex}
                />
            )}
        </Stack>
    );
};
