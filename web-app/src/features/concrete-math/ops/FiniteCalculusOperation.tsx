"use client";
import { Stack } from "../../../design/primitives/Stack";
import { useState } from "react";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { View } from "../../../design/primitives/View";
import { Button } from "../../../design/baseComponents/Button";
import { Flex } from "../../../design/primitives/Flex";
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { CopyIcon, SaveIcon } from "lucide-react";
import {
    ConcreteMathHelper,
    ClosedFormDto,
    NumericComplexDto
} from "@my-project/client-sdk/api/concreteMath";
import { algebraicErrorToDisplayMessage } from "../../algebraic/config/errorCodeMessages";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { PolynomialInput } from "../../algebraic/types/PolynomialInput";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../stores/variableManager/types";

export const FiniteCalculusOperation = () => {
    const [coeffs, setCoeffs] = useState<string[]>(["0", "0", "1"]); // n^2
    const [resultLatex, setResultLatex] = useState<string | null>(null);
    const [resultStr, setResultStr] = useState<string | null>(null);
    const [operation, setOperation] = useState<"diff" | "sum" | "gen" | null>(null);

    const [specialM, setSpecialM] = useState<number>(3);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ value: string; latex?: string; kind: VariableKind } | null>(null);

    const generateLatex = (arr: string[]) => {
        if (arr.length === 0) return "0";
        const parts = [];
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === "0" && i !== 0) continue;
            const termStr = arr[i];
            let termLatex = termStr;
            const isNegative = termStr.startsWith("-");
            const absTerm = isNegative ? termStr.substring(1) : termStr;

            if (absTerm.includes("/")) {
                const [num, den] = absTerm.split("/");
                termLatex = (isNegative ? "-" : "") + `\\frac{${num}}{${den}}`;
            } else {
                termLatex = termStr;
            }

            if (i > 0) {
                if (termStr === "1") termLatex = "";
                if (termStr === "-1") termLatex = "-";
                termLatex += i === 1 ? "n" : `n^{${i}}`;
            }
            if (termLatex !== "0" || (i === 0 && parts.length === 0)) {
                parts.push(termLatex);
            }
        }
        if (parts.length === 0) return "0";
        return parts.join(" + ").replace(/\+ -/g, "- ");
    }

    async function onRun(op: "diff" | "sum" | "partial") {
        setBusy(true);
        setError(null);
        setOperation(op === "partial" ? "sum" : op);
        try {
            const dto: NumericComplexDto[] = coeffs.map(c => ({ re: parseFloat(c.trim() || "0"), im: 0 }));
            let res: NumericComplexDto[];
            if (op === "diff") {
                res = await ConcreteMathHelper.discreteDiff(dto);
            } else if (op === "sum") {
                res = await ConcreteMathHelper.discreteSum(dto);
            } else {
                const cf: ClosedFormDto = {
                    terms: [{
                        polynomial: dto,
                        base: { re: 1, im: 0 }
                    }]
                };
                const resCf = await ConcreteMathHelper.partialSum(cf);
                if (resCf.terms.length > 0) {
                    res = resCf.terms[0].polynomial;
                } else {
                    res = [];
                }
            }

            const resStrs = res.map(c => parseFloat(c.re.toFixed(10)).toString());
            setResultLatex(generateLatex(resStrs));
            setResultStr(resStrs.join(", "));
        } catch (e: any) {
            console.error(e);
            setError(algebraicErrorToDisplayMessage(e));
        } finally {
            setBusy(false);
        }
    }

    async function onGenerateSpecial(type: "falling" | "rising" | "binom") {
        setBusy(true);
        setError(null);
        setOperation("gen");
        try {
            let res: NumericComplexDto[];
            if (type === "falling") res = await ConcreteMathHelper.cmFallingFactorialPoly(specialM);
            else if (type === "rising") res = await ConcreteMathHelper.cmRisingFactorialPoly(specialM);
            else res = await ConcreteMathHelper.cmBinomPoly(specialM);

            const resStrs = res.map(c => parseFloat(c.re.toFixed(10)).toString());
            setResultLatex(generateLatex(resStrs));
            setResultStr(resStrs.join(", "));
        } catch (e: any) {
            console.error(e);
            setError(algebraicErrorToDisplayMessage(e));
        } finally {
            setBusy(false);
        }
    }

    const inputBlock = (
        <Stack gap="xl">
            <PolynomialInput
                coeffs={coeffs}
                onChange={setCoeffs}
                coeffType="numeric"
                variable="n"
                label="多項式 P(n)"
            />

            <View bg="muted" padding="md" rounded="lg" className="border">
                <Text weight="bold" variant="body" className="mb-3">特殊多項式の生成</Text>
                <Stack gap="md">
                    <Flex gap="md" align="end" wrap={true}>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">次数 m</Text>
                            <NumberInput value={specialM} onChangeNumber={v => setSpecialM(v ?? 0)} />
                        </Stack>
                        <Flex gap="sm">
                            <Button onClick={() => onGenerateSpecial("falling")} loading={busy} variant="outline" size="sm">n^(m) 下降階乗</Button>
                            <Button onClick={() => onGenerateSpecial("rising")} loading={busy} variant="outline" size="sm">n^[m] 上昇階乗</Button>
                            <Button onClick={() => onGenerateSpecial("binom")} loading={busy} variant="outline" size="sm">(n choose m)</Button>
                        </Flex>
                    </Flex>
                    <Text variant="xs" color="secondary" className="italic">
                        ※ 生成された多項式は下の「多項式 P(n)」に反映されませんが、直接計算結果として表示されます。
                    </Text>
                </Stack>
            </View>
        </Stack>
    );

    const actionBlock = (
        <Stack gap="sm" align="center">
            <Flex gap="md" wrap={true} justify="center">
                <Button
                    onClick={() => onRun("diff")}
                    disabled={busy}
                    loading={busy && operation === "diff"}
                    size="lg"
                    className="px-8 font-bold shadow-md"
                >
                    差分 ΔP(n)
                </Button>
                <Button
                    onClick={() => onRun("sum")}
                    disabled={busy}
                    loading={busy && operation === "sum"}
                    size="lg"
                    color="secondary"
                    className="px-8 font-bold shadow-md"
                >
                    不定和分 ΣP(n)δn
                </Button>
                <Button
                    onClick={() => onRun("partial")}
                    disabled={busy}
                    loading={busy && operation === "sum"}
                    size="lg"
                    variant="outline"
                    className="px-8 font-bold shadow-md border-2 border-primary text-primary hover:bg-primary/5"
                >
                    有限和 Σ_{"{"}k = 0{"}"}^n P(k)
                </Button>
            </Flex>
            {error && <Text className="text-red-500 text-center font-medium mt-2">{error}</Text>}
        </Stack>
    );

    const outputBlock = resultLatex ? (
        <Stack gap="md">
            <Text weight="bold" className="text-xl text-slate-800 dark:text-slate-100 mb-2">
                {operation === "diff" ? "差分結果 ΔP(n)" : operation === "gen" ? "生成多項式" : "結果"}
            </Text>
            <View bg="card" rounded="lg" padding="lg" className="relative shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 ring-1 ring-black/5 dark:ring-white/10">
                <Stack direction="row" className="justify-between items-center" gap="sm">
                    <View className="flex-1 overflow-x-auto min-h-[4rem] flex items-center justify-center">
                        <Markdown className="text-2xl py-2">{`$$${resultLatex}${operation === "sum" ? " + C" : ""}$$`}</Markdown>
                    </View>
                    <Stack direction="row" gap="xs" className="shrink-0 self-start mt-1">
                        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(resultStr ?? "")}>
                            <CopyIcon size={20} className="text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setPendingSave({ value: resultStr ?? "", latex: resultLatex, kind: "algebraic.symbolicComplex" })}>
                            <SaveIcon size={20} className="text-amber-500" />
                        </Button>
                    </Stack>
                </Stack>
            </View>
            {operation === "sum" && (
                <Text variant="xs" color="secondary" className="italic text-center">
                    ※ 離散的和分（不定和分）において、ΣP(n)δn = Q(n) + C は ΔQ(n) = P(n) を満たします。
                </Text>
            )}
        </Stack>
    ) : null;

    return (
        <Stack gap="xl">
            <UnaryOperationLayout
                input={inputBlock}
                action={actionBlock}
                output={outputBlock}
            />
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
