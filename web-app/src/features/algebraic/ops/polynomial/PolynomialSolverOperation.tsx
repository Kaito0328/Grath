"use client";
import { Stack } from "../../../../design/primitives/Stack";
import { useState } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { Markdown } from "../../../../design/baseComponents/Markdown";
import { Button } from "../../../../design/baseComponents/Button";
import { View } from "../../../../design/primitives/View";
import { NumberInput } from "../../../../design/baseComponents/NumberInput";
import { SaveVariableModal } from "../../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../../stores/variableManager/types";
import { PolynomialSolverHelper } from "@my-project/client-sdk/api/polynomialSolver";
import { algebraicErrorToDisplayMessage } from "../../config/errorCodeMessages";
import { SymbolicComplexOutput } from "../../types/SymbolicComplexOutput";
import { PolynomialInput } from "../../types/PolynomialInput";
import { PolyOpMode, PolyCoeffType } from "../PolynomialOperations";
import { CopyIcon, SaveIcon } from "lucide-react";
import { UnaryOperationLayout } from "../../../../shared/layouts/UnaryOperationLayout";
import { BinaryOperationLayout } from "../../layouts/BinaryOperationLayout";

const complexKind: VariableKind = "algebraic.symbolicComplex";
const polynomialCoeffsKind: VariableKind = "polynomial.coeffs";
type PendingSave = { value: string; latex?: string; kind: VariableKind } | null;

interface RootItem {
    text: string;
    latex: string;
}

interface PolynomialSolverOperationProps {
    mode: PolyOpMode;
    coeffType: PolyCoeffType;
    startIndex?: number;
}

export const PolynomialSolverOperation = ({ mode, coeffType, startIndex = 1 }: PolynomialSolverOperationProps) => {
    const [coeffsA, setCoeffsA] = useState<string[]>(["-2", "0", "1"]);
    const [coeffsB, setCoeffsB] = useState<string[]>(["1", "1"]);

    const [roots, setRoots] = useState<RootItem[] | null>(null);
    const [polyResult, setPolyResult] = useState<string | null>(null);
    const [polyLatex, setPolyLatex] = useState<string | null>(null);
    const [verificationLatex, setVerificationLatex] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<PendingSave>(null);
    const [numericSolveMethod, setNumericSolveMethod] = useState<"numeric" | "exact">("numeric");

    const isSolveMode = mode === "solve";
    const [precision, setPrecision] = useState<number>(6);

    // helper to convert array to csv
    const toCsv = (arr: string[]) => arr.map(s => s.trim() || "0").join(",");
    const toNumberArray = (arr: string[]) => arr.map(s => parseFloat(s.trim() || "0"));
    const fromNumberArray = (arr: Float64Array | number[]) => Array.from(arr).map(n => n.toString());

    // Generate latex for polynomial from string array
    const generateLatex = (arr: string[], prec?: number) => {
        if (arr.length === 0) return "0";
        const parts = [];
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === "0" && i !== 0) continue;
            const termStr = prec !== undefined ? parseFloat(parseFloat(arr[i]).toPrecision(prec)).toString() : arr[i];

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
                termLatex += i === 1 ? "x" : `x^{${i}}`;
            }
            if (termLatex !== "0" || (i === 0 && parts.length === 0)) {
                parts.push(termLatex);
            }
        }
        if (parts.length === 0) return "0";
        return parts.join(" + ").replace(/\+ -/g, "- ");
    };

    async function verifyRoots(computedRoots: RootItem[], rawRoots?: { re: number, im: number }[]) {
        try {
            if (rawRoots) {
                // Expand numeric roots
                let coeffs = [{ re: 1, im: 0 }];
                for (const r of rawRoots) {
                    const next = Array(coeffs.length + 1).fill(null).map(() => ({ re: 0, im: 0 }));
                    for (let i = 0; i < coeffs.length; i++) {
                        next[i + 1].re += coeffs[i].re;
                        next[i + 1].im += coeffs[i].im;
                        next[i].re -= (coeffs[i].re * r.re - coeffs[i].im * r.im);
                        next[i].im -= (coeffs[i].re * r.im + coeffs[i].im * r.re);
                    }
                    coeffs = next;
                }
                const leadingOriginal = parseFloat(coeffsA[coeffsA.length - 1] || "1");
                const scaledCoeffs = coeffs.map(c => (c.re * leadingOriginal).toString());
                setVerificationLatex(generateLatex(scaledCoeffs, precision));
            } else {
                // Fallback for symbolic/exact: format original array
                setVerificationLatex(generateLatex(coeffsA));
            }
        } catch (e) {
            console.warn("Verification parsing error:", e);
            setVerificationLatex(null);
        }
    }

    async function onRun() {
        setBusy(true);
        setError(null);
        setRoots(null);
        setPolyResult(null);
        setPolyLatex(null);
        setVerificationLatex(null);

        try {
            if (isSolveMode) {
                if (coeffType === "symbolic") {
                    const res = await PolynomialSolverHelper.solveSymbolic(toCsv(coeffsA));
                    const rootsWithLatex = await Promise.all(
                        res.map(async (r) => ({
                            text: r.toString(),
                            latex: await r.toLatex(),
                        }))
                    );
                    setRoots(rootsWithLatex);
                    await verifyRoots(rootsWithLatex);
                } else if (coeffType === "rational" || (coeffType === "numeric" && numericSolveMethod === "exact")) {
                    const res = await PolynomialSolverHelper.solveRationalCsv(toCsv(coeffsA));
                    const rootsWithLatex = await Promise.all(
                        res.map(async (r) => ({
                            text: r.toString(),
                            latex: await r.toLatex(),
                        }))
                    );
                    setRoots(rootsWithLatex);
                    await verifyRoots(rootsWithLatex);
                } else {
                    const res = await PolynomialSolverHelper.solveNumeric(toNumberArray(coeffsA));
                    const rootsWithLatex = res.map((r: any) => {
                        const reStr = r.re.toPrecision(precision);
                        let text = "";
                        if (Math.abs(r.im) < 1e-10) {
                            text = reStr;
                        } else {
                            text = `${reStr} ${r.im >= 0 ? "+" : "-"} ${Math.abs(r.im).toPrecision(precision)}i`;
                        }
                        return { text, latex: text };
                    });
                    setRoots(rootsWithLatex);
                    await verifyRoots(rootsWithLatex, res.map((r: any) => ({ re: r.re, im: r.im })));
                }
            } else {
                let resCsv = "";
                let resArr: string[] = [];
                if (coeffType === "symbolic") {
                    const aCsv = toCsv(coeffsA);
                    const bCsv = toCsv(coeffsB);
                    if (mode === "add") resCsv = await PolynomialSolverHelper.addSymbolic(aCsv, bCsv);
                    else if (mode === "sub") resCsv = await PolynomialSolverHelper.subSymbolic(aCsv, bCsv);
                    else if (mode === "mul") resCsv = await PolynomialSolverHelper.mulSymbolic(aCsv, bCsv);
                    else if (mode === "div") resCsv = await PolynomialSolverHelper.divSymbolic(aCsv, bCsv);
                    resArr = resCsv.split(",");
                } else if (coeffType === "rational") {
                    const aCsv = toCsv(coeffsA);
                    const bCsv = toCsv(coeffsB);
                    if (mode === "add") resCsv = await PolynomialSolverHelper.addRational(aCsv, bCsv);
                    else if (mode === "sub") resCsv = await PolynomialSolverHelper.subRational(aCsv, bCsv);
                    else if (mode === "mul") resCsv = await PolynomialSolverHelper.mulRational(aCsv, bCsv);
                    else if (mode === "div") resCsv = await PolynomialSolverHelper.divRational(aCsv, bCsv);
                    resArr = resCsv.split(",");
                } else {
                    const aNum = toNumberArray(coeffsA);
                    const bNum = toNumberArray(coeffsB);
                    let out: Float64Array = new Float64Array();
                    if (mode === "add") out = await PolynomialSolverHelper.addNumeric(aNum, bNum);
                    else if (mode === "sub") out = await PolynomialSolverHelper.subNumeric(aNum, bNum);
                    else if (mode === "mul") out = await PolynomialSolverHelper.mulNumeric(aNum, bNum);
                    else if (mode === "div") out = await PolynomialSolverHelper.divNumeric(aNum, bNum);
                    resArr = fromNumberArray(out);
                }
                setPolyResult(resArr.join(", "));
                setPolyLatex(generateLatex(resArr));
            }
        } catch (e: any) {
            console.error(e);
            setError(algebraicErrorToDisplayMessage(e));
        } finally {
            setBusy(false);
        }
    }

    const canRun = !busy && coeffsA.length > 0;
    const modeLabel = isSolveMode ? "解を求める" :
        mode === "add" ? "加算を実行" :
            mode === "sub" ? "減算を実行" :
                mode === "mul" ? "乗算を実行" : "除算を実行";

    const verificationBlock = verificationLatex ? (
        <View bg="muted" rounded="md" padding={"md"} className="border-2 border-slate-300 dark:border-slate-600">
            <Stack gap="sm">
                <Text weight="semibold" className="text-slate-700 dark:text-slate-300">根を掛け合わせた展開式：</Text>
                <View className="flex justify-center my-2">
                    <Markdown className="text-xl">{`$$${verificationLatex}$$`}</Markdown>
                </View>
            </Stack>
        </View>
    ) : null;

    const actionBlock = (
        <Stack gap={"sm"}>
            {isSolveMode && coeffType === "numeric" && (
                <Stack direction="row" gap="sm" className="justify-center items-center flex-wrap">
                    <Stack direction="row" gap="xs" className="items-center">
                        <Text weight="semibold" className="text-slate-600 dark:text-slate-400">解法:</Text>
                        <Stack direction="row" gap="xs" className="items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-600">
                            <Button
                                size="sm"
                                variant={numericSolveMethod === "numeric" ? "solid" : "ghost"}
                                onClick={() => setNumericSolveMethod("numeric")}
                                className={numericSolveMethod === "numeric" ? "bg-white text-slate-800 shadow" : "text-slate-500"}
                            >
                                数値計算
                            </Button>
                            <Button
                                size="sm"
                                variant={numericSolveMethod === "exact" ? "solid" : "ghost"}
                                onClick={() => setNumericSolveMethod("exact")}
                                className={numericSolveMethod === "exact" ? "bg-white text-slate-800 shadow" : "text-slate-500"}
                            >
                                記号的 (厳密)
                            </Button>
                        </Stack>
                    </Stack>

                    {numericSolveMethod === "numeric" && (
                        <Stack direction="row" gap="xs" className="items-center">
                            <Text weight="semibold" className="text-slate-600 dark:text-slate-400">精度:</Text>
                            <NumberInput
                                value={precision}
                                onChangeNumber={(value) => {
                                    if (!Number.isFinite(value)) {
                                        setPrecision(6);
                                        return;
                                    }
                                    const next = Math.max(1, Math.min(15, Math.trunc(value)));
                                    setPrecision(next);
                                }}
                                allowFloat={false}
                                min={1}
                                max={15}
                                className="w-16 text-center"
                            />
                        </Stack>
                    )}
                </Stack>
            )}
            <Stack direction="row" className="justify-center mt-2">
                <Button onClick={onRun} disabled={!canRun} loading={busy} size="lg" className="w-1/3 min-w-[200px] text-lg font-bold shadow-md">
                    {modeLabel}
                </Button>
            </Stack>
            {error && <Text className="text-red-500 text-center font-medium mt-2">{error}</Text>}
        </Stack>
    );

    const inputA = (
        <PolynomialInput
            label={isSolveMode ? "多項式 P(x)" : "多項式 A(x)"}
            coeffs={coeffsA}
            onChange={setCoeffsA}
            coeffType={coeffType}
			kind={polynomialCoeffsKind}
			suggestedName={isSolveMode ? "P" : "A"}
        />
    );

    const inputB = (
        <PolynomialInput
            label="多項式 B(x)"
            coeffs={coeffsB}
            onChange={setCoeffsB}
            coeffType={coeffType}
			kind={polynomialCoeffsKind}
			suggestedName={"B"}
        />
    );

    const outputSolve = roots ? (
        <Stack gap={"md"}>
            <Text weight="bold" className="text-xl text-slate-800 dark:text-slate-100 mb-2">方程式の根 (Roots)</Text>
            {roots.length === 0 && <Text className="text-slate-500 italic">根が見つかりませんでした</Text>}
            {roots.map((r, i) => (
                <SymbolicComplexOutput
                    key={i}
                    label={<Markdown>{`$x_{${i + 1}}$`}</Markdown>}
                    value={r.text}
                    latex={r.latex}
                    onRequestSave={(args) => setPendingSave({ ...args, kind: complexKind })}
                />
            ))}
        </Stack>
    ) : null;

    const outputBinary = polyResult ? (
        <Stack gap={"md"}>
            <Text weight="bold" className="text-xl text-slate-800 dark:text-slate-100 mb-2">計算結果</Text>
            <View bg="card" rounded="lg" padding={"lg"} className="relative shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 ring-1 ring-black/5 dark:ring-white/10">
                <Stack direction="row" className="justify-between items-center" gap="sm">
                    <View className="flex-1 overflow-x-auto min-h-[4rem] flex items-center justify-center">
                        {polyLatex ? (
                            <Markdown className="text-2xl py-2">{`$$${polyLatex}$$`}</Markdown>
                        ) : (
                            <Text className="text-lg font-mono">{polyResult}</Text>
                        )}
                    </View>
                    <Stack direction="row" gap="xs" className="shrink-0 self-start mt-1">
                        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(polyResult)}>
                            <CopyIcon size={20} className="text-slate-500" />
                        </Button>
                        <Button
							variant="ghost"
							size="icon"
							onClick={() => setPendingSave({ value: polyResult, latex: polyLatex ?? "", kind: polynomialCoeffsKind })}
						>
                            <SaveIcon size={20} className="text-amber-500" />
                        </Button>
                    </Stack>
                </Stack>
            </View>
        </Stack>
    ) : null;

    return (
        <>
            {isSolveMode ? (
                <UnaryOperationLayout
                    startIndex={startIndex}
                    input={inputA}
                    action={actionBlock}
                    output={outputSolve}
                    verification={verificationBlock}
                />
            ) : (
                <BinaryOperationLayout
                    startIndex={startIndex}
                    left={inputA}
                    right={inputB}
                    action={actionBlock}
                    output={outputBinary}
                />
            )}

            {pendingSave && (
                <SaveVariableModal
                    open={pendingSave !== null}
                    onClose={() => setPendingSave(null)}
                    kind={pendingSave.kind}
                    value={pendingSave.value}
                    latex={pendingSave.latex}
                />
            )}
        </>
    );
};
