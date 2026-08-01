"use client";
import { Stack } from "../../../design/primitives/Stack";
import { useState } from "react";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { View } from "../../../design/primitives/View";
import { Button } from "../../../design/baseComponents/Button";
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { Input } from "../../../design/baseComponents/Input";
import { Flex } from "../../../design/primitives/Flex";
import { PlusCircle, Trash2, CheckCircle2, FlaskConical } from "lucide-react";
import {
    ConcreteMathHelper,
    ClosedFormDto,
    NonHomogeneousSymbolicDto,
    GeneralTermDto,
    NumericComplexDto
} from "@my-project/client-sdk/api/concreteMath";
import type { RationalDTO as RationalDto, SymbolicExprDTO as SymbolicExprDto } from "@my-project/client-sdk/api/algebraicDtoApi";
import { algebraicErrorToDisplayMessage } from "../../algebraic/config/errorCodeMessages";
import { RecurrenceInput, CoeffType, NonHomogeneousTerm } from "../ui/RecurrenceInput";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { Select } from "../../../design/baseComponents/Select";
import { SymbolicExprOutput } from "../../algebraic/types/SymbolicExprOutput";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../stores/variableManager/types";
import { SymbolicExpr } from "@my-project/client-sdk/api/algebraicApi";
import { PolynomialInput } from "../../algebraic/types/PolynomialInput";

export const RecurrenceSolverOperation = () => {
    const [coeffs, setCoeffs] = useState<string[]>(["1", "1"]);
    const [initials, setInitials] = useState<string[]>(["0", "1"]);
    const [nhTerms, setNhTerms] = useState<NonHomogeneousTerm[]>([]);

    const [coeffType, setCoeffType] = useState<CoeffType>("numeric");
    const [solveMethod, setSolveMethod] = useState<"numeric" | "exact">("numeric");

    const [result, setResult] = useState<string | null>(null);
    const [symbolicResult, setSymbolicResult] = useState<SymbolicExpr | null>(null);
    const [numericDto, setNumericDto] = useState<ClosedFormDto | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const [evalN, setEvalN] = useState<number>(10);
    const [evalRes, setEvalRes] = useState<string | null>(null);

    const [verifyN, setVerifyN] = useState<number>(10);
    const [verifyClosed, setVerifyClosed] = useState<string | null>(null);
    const [verifyIter, setVerifyIter] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [precision, setPrecision] = useState<number>(6);

    const [pendingSave, setPendingSave] = useState<{ value: string; latex?: string; kind: VariableKind } | null>(null);

    const addNhTerm = () => {
        setNhTerms([...nhTerms, { poly: ["0"], base: "1" }]);
    };

    const removeNhTerm = (index: number) => {
        setNhTerms(nhTerms.filter((_, i) => i !== index));
    };

    const updateNhTerm = (index: number, term: NonHomogeneousTerm) => {
        const newTerms = [...nhTerms];
        newTerms[index] = term;
        setNhTerms(newTerms);
    };

    async function onRun() {
        setBusy(true);
        setError(null);
        setResult(null);
        setSymbolicResult(null);
        setNumericDto(null);
        setEvalRes(null);
        setVerifyClosed(null);
        setVerifyIter(null);

        try {
            if (coeffType === "symbolic" || (coeffType === "numeric" && solveMethod === "exact") || coeffType === "rational") {
                const toRationalDto = (raw: string, defaultNumer: string): RationalDto => {
                    const text = (raw ?? "").trim();
                    const safe = text.length === 0 ? defaultNumer : text;
                    const [numerRaw, denomRaw] = safe.split("/", 2);
                    const numer = (numerRaw ?? "").trim() || defaultNumer;
                    const denom = (denomRaw ?? "").trim() || "1";

                    return {
                        numer,
                        denom,
                        dirty: false
                    };
                };

                const toRationalExpr = (raw: string, defaultNumer: string): SymbolicExprDto => ({
                    kind: "Rational",
                    value: toRationalDto(raw, defaultNumer)
                });

                const cDtos: RationalDto[] = coeffs.map((c) => toRationalDto(c, "0"));
                const iDtos: SymbolicExprDto[] = initials.map((i) => toRationalExpr(i, "0"));
                const nhDtos: NonHomogeneousSymbolicDto[] = nhTerms.map((nh) => ({
                    poly: nh.poly.map((p) => toRationalExpr(p, "0")),
                    base: toRationalDto(nh.base, "1")
                }));

                const resDto = await ConcreteMathHelper.solveRecurrenceSymbolic(cDtos, iDtos, nhDtos);
                const res = SymbolicExpr.fromDTO(resDto);
                setSymbolicResult(res);
                setResult(await res.toLatex());
            } else {
                const cArr = coeffs.map(c => parseFloat(c.trim() || "0"));
                const iArr = initials.map(i => parseFloat(i.trim() || "0"));
                const nhDtos: GeneralTermDto[] = nhTerms.map(nh => ({
                    polynomial: nh.poly.map(p => ({ re: parseFloat(p.trim() || "0"), im: 0 })),
                    base: { re: parseFloat(nh.base.trim() || "1"), im: 0 }
                }));

                const resDto = await ConcreteMathHelper.solveRecurrence(cArr, iArr, nhDtos);
                const resStr = await ConcreteMathHelper.formatClosedForm(resDto);
                setNumericDto(resDto);
                setResult(resStr);
            }
        } catch (e: any) {
            console.error(e);
            setError(algebraicErrorToDisplayMessage(e));
        } finally {
            setBusy(false);
        }
    }

    async function onEval() {
        if (!numericDto && !symbolicResult) return;
        try {
            if (numericDto) {
                const res = await ConcreteMathHelper.evalClosedForm(numericDto, evalN);
                setEvalRes(formatComplex(res, precision));
            } else if (symbolicResult) {
                setEvalRes("記号的解の評価は現在サポートされていません");
            }
        } catch (e: any) {
            setError(algebraicErrorToDisplayMessage(e));
        }
    }

    async function onVerify() {
        if (!numericDto) return;
        setVerifying(true);
        try {
            // Analytical
            const resClosed = await ConcreteMathHelper.evalClosedForm(numericDto, verifyN);
            setVerifyClosed(formatComplex(resClosed, precision));

            // Iterative
            const cArr = coeffs.map(c => parseFloat(c.trim() || "0"));
            const iArr = initials.map(i => parseFloat(i.trim() || "0"));
            const nhDtos: GeneralTermDto[] = nhTerms.map(nh => ({
                polynomial: nh.poly.map(p => ({ re: parseFloat(p.trim() || "0"), im: 0 })),
                base: { re: parseFloat(nh.base.trim() || "1"), im: 0 }
            }));
            const resIter = await ConcreteMathHelper.evalRecurrenceIterative(cArr, iArr, verifyN, nhDtos);
            setVerifyIter(formatComplex(resIter, precision));
        } catch (e: any) {
            setError(algebraicErrorToDisplayMessage(e));
        } finally {
            setVerifying(false);
        }
    }

    function formatComplex(res: NumericComplexDto, prec: number) {
        return Math.abs(res.im) < 1e-10
            ? parseFloat(res.re.toPrecision(prec)).toString()
            : `${parseFloat(res.re.toPrecision(prec))} ${res.im >= 0 ? "+" : "-"} ${parseFloat(Math.abs(res.im).toPrecision(prec))}i`;
    }

    const onPickRecurrence = async (value: string) => {
        try {
            const data = JSON.parse(value);
            if (data.coeffs) setCoeffs(data.coeffs);
            if (data.initials) setInitials(data.initials);
        } catch (e) {
            console.error("Failed to parse recurrence data", e);
        }
    };

    const canRun = !busy && coeffs.length > 0;

    const settingsBlock = (
        <Stack gap="md" className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Text weight="bold" variant="body">設定</Text>
            <Flex gap="xl" wrap={true}>
                <Stack gap="xs">
                    <Text variant="xs" weight="semibold" color="secondary">係数の種類</Text>
                    <Select
                        value={coeffType}
                        onChange={(e) => setCoeffType(e.target.value as CoeffType)}
                        className="w-40"
                        options={[
                            { value: "numeric", label: "数値 (Numeric)" },
                            { value: "rational", label: "有理数 (Rational)" },
                            { value: "symbolic", label: "記号表示 (Symbolic)" },
                        ]}
                    />
                </Stack>
            </Flex>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="lg">
            <RecurrenceInput
                coeffs={coeffs}
                onCoeffsChange={setCoeffs}
                initials={initials}
                onInitialsChange={setInitials}
                coeffType={coeffType}
                label="漸化式の定義"
                onRequestSave={(args) => setPendingSave({ ...args, kind: "algebraic.symbolicComplex" })}
                onPickVariable={onPickRecurrence}
            />

            <Stack gap="md" className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Flex justify="between" align="center">
                    <Text weight="semibold" color="primary" variant="detail" className="uppercase tracking-wider text-[11px] block">非斉次項 (F(n) = Σ Pᵢ(n) · qᵢⁿ)</Text>
                    <Button variant="ghost" size="sm" onClick={addNhTerm} className="text-primary hover:bg-primary/10">
                        <Flex gap="xs" align="center">
                            <PlusCircle size={14} />
                            <Text variant="xs" span={true}>非斉次項を追加</Text>
                        </Flex>
                    </Button>
                </Flex>

                <Stack gap="sm">
                    {nhTerms.map((nh, idx) => (
                        <View key={idx} bg="muted" rounded="lg" padding="md" className="border border-slate-200 dark:border-slate-800 relative group animate-in fade-in slide-in-from-top-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeNhTerm(idx)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-danger w-7 h-7"
                            >
                                <Trash2 size={14} />
                            </Button>

                            <Flex gap="md" align="center" wrap={true}>
                                <Text weight="bold" className="text-slate-400 text-lg" span={true}>+</Text>
                                <View className="flex-1 min-w-[200px]">
                                    <PolynomialInput
                                        coeffs={nh.poly}
                                        onChange={(p) => updateNhTerm(idx, { ...nh, poly: p })}
                                        coeffType={coeffType}
                                        variable="n"
                                        label="多項式 P(n)"
                                        placeholder="0"
                                    />
                                </View>
                                <Text weight="bold" className="text-slate-400 text-lg" span={true}>·</Text>
                                <Stack gap="xs">
                                    <Text variant="detail" weight="semibold" className="text-[10px]" span={true}>底 q</Text>
                                    <Input
                                        value={nh.base}
                                        onChange={(e) => updateNhTerm(idx, { ...nh, base: e.target.value })}
                                        placeholder="1"
                                        className="w-16 h-8 text-sm text-center"
                                    />
                                </Stack>
                                <Text weight="bold" className="text-slate-400 text-lg">ⁿ</Text>
                            </Flex>
                        </View>
                    ))}
                    {nhTerms.length === 0 && (
                        <View className="py-4 border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-lg flex items-center justify-center">
                            <Text variant="detail" className="text-slate-400 italic">斉次漸化式（非斉次項なし）</Text>
                        </View>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );

    const actionBlock = (
        <Stack gap={"sm"}>
            {coeffType === "numeric" && (
				<Stack direction="row" gap="sm" className="justify-center items-center flex-wrap">
                    <Stack direction="row" gap="xs" className="items-center">
                        <Text weight="semibold" className="text-slate-600 dark:text-slate-400 text-sm">解法:</Text>
                        <Stack direction="row" gap="xs" className="items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-600">
                            {(["numeric", "exact"] as const).map((m) => (
                                <Button
                                    key={m}
                                    size="sm"
                                    variant={solveMethod === m ? "solid" : "ghost"}
                                    onClick={() => setSolveMethod(m)}
                                    className={solveMethod === m ? "bg-white text-slate-800 shadow" : "text-slate-500"}
                                >
                                    {m === 'numeric' ? '数値計算' : '記号的 (厳密)'}
                                </Button>
                            ))}
                        </Stack>
                    </Stack>

                    {solveMethod === "numeric" && (
                        <Stack direction="row" gap="xs" className="items-center">
                            <Text weight="semibold" className="text-slate-600 dark:text-slate-400 text-sm">精度:</Text>
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
                                className="w-16 h-8 text-center text-sm"
                            />
                        </Stack>
                    )}
				</Stack>
            )}
            <Stack direction="row" className="justify-center mt-2">
                <Button onClick={onRun} disabled={!canRun} loading={busy} size="lg" className="w-1/3 min-w-[200px] text-lg font-bold shadow-md">
                    一般項を求める
                </Button>
            </Stack>
            {error && <Text className="text-red-500 text-center font-medium mt-2 mx-auto max-w-2xl">{error}</Text>}
        </Stack>
    );

    const outputBlock = result ? (
        <Stack gap="xl">
            <SymbolicExprOutput
                label={<Text variant="h3" weight="bold">一般項 $a_n$</Text>}
                value={symbolicResult ? symbolicResult.toString() : result}
                latex={result}
                onRequestSave={(args) => setPendingSave({ ...args, kind: "algebraic.symbolicComplex" })}
            />

            {numericDto && (
                <Stack gap="lg">
                    <Stack gap="sm" className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <View className="absolute top-0 right-0 p-3 opacity-10">
                            <CheckCircle2 size={48} className="text-primary" />
                        </View>
                        <Text weight="bold" color="primary" variant="detail" className="uppercase tracking-wider text-[10px]">値の評価</Text>
                        <Flex gap="md" align="end">
                            <Stack gap="xs">
                                <Text variant="xs" weight="medium" color="secondary">第 n 項</Text>
                                <NumberInput
                                    value={evalN}
                                    onChangeNumber={(val) => setEvalN(val ?? 0)}
                                    min={0}
                                    className="h-11 text-sm w-28"
                                />
                            </Stack>
                            <Button variant="outline" onClick={onEval} disabled={busy} className="h-11 px-8 rounded-lg border-2">計算する</Button>
                        </Flex>

                        {evalRes && (
                            <View className="mt-4 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center shadow-inner group transition-all animate-in zoom-in-95 duration-200">
                                <Text variant="detail" weight="semibold" className="text-slate-400 text-xs">{`項目 $a_{${evalN}}:$`}</Text>
                                <Markdown className="font-mono tracking-tight text-primary text-2xl overflow-visible">{`$${evalRes}$`}</Markdown>
                            </View>
                        )}
                    </Stack>

                    <Stack gap="sm" className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
                        <View className="absolute top-0 right-0 p-3 opacity-10">
                            <FlaskConical size={48} className="text-indigo-500" />
                        </View>
                        <Flex gap="xs" align="center">
                            <Text weight="bold" className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">解の検証</Text>
                            <Text variant="xs" color="secondary">(分析解 vs 数值的代入)</Text>
                        </Flex>
                        <Flex gap="md" align="end">
                            <Stack gap="xs">
                                <Text variant="xs" weight="medium" color="secondary">検証する n</Text>
                                <NumberInput
                                    value={verifyN}
                                    onChangeNumber={(val) => setVerifyN(val ?? 0)}
                                    min={0}
                                    className="h-11 text-sm w-28"
                                />
                            </Stack>
                            <Button color="secondary" onClick={onVerify} disabled={verifying} loading={verifying} className="h-11 px-8 rounded-lg">検証を実行</Button>
                        </Flex>

                        {(verifyClosed !== null || verifyIter !== null) && (
                            <Stack gap="sm" className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <View className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <Flex justify="between" align="center">
                                        <Text variant="xs" weight="medium" color="secondary">分析解 (Closed-form)</Text>
                                        <Text variant="detail" weight="bold" className="font-mono text-slate-700 dark:text-slate-300">{verifyClosed}</Text>
                                    </Flex>
                                </View>
                                <View className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <Flex justify="between" align="center">
                                        <Text variant="xs" weight="medium" color="secondary">逐次計算 (Iterative)</Text>
                                        <Text variant="detail" weight="bold" className="font-mono text-slate-700 dark:text-slate-300">{verifyIter}</Text>
                                    </Flex>
                                </View>
                                {verifyClosed === verifyIter && (
                                    <Flex gap="xs" align="center" className="justify-center pt-1">
                                        <CheckCircle2 size={14} className="text-success" />
                                        <Text variant="xs" weight="bold" className="text-success">結果が一致しました</Text>
                                    </Flex>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            )}
        </Stack>
    ) : null;

    return (
        <Stack gap="xl">
            {settingsBlock}
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
