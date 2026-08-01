"use client";
import { useState, useEffect } from "react";
import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Button } from "../../../design/baseComponents/Button";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Divider } from "../../../design/baseComponents/Divider";
import { View } from "../../../design/primitives/View";
import {
    LinalgApi,
    RationalMatrixDto,
} from "@my-project/client-sdk";
import { AppErrorCodes, tryParseAppErrorMessage } from "@my-project/client-sdk/api/runtime";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { LinalgCoeffType, LinalgOpMode, LinalgGroupKey } from "../LinalgOperations";
import { MatrixInput } from "../ui/MatrixInput";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { ensureClientSdkReady } from "../../../shared/wasm/ensureClientSdkReady";
import {
    numericTokenToRational,
    rationalMatrixDtoFromCells,
    rationalMatrixDtoToCsv,
} from "../model/rationalMatrixDto";

type Props = {
    mode: LinalgOpMode;
    coeffType: LinalgCoeffType;
    group: LinalgGroupKey;
    startIndex?: number;
};

// Converts 2D array to CSV needed by WASM
const toCsv = (data: string[][]) => {
    return data.map(row => row.map(c => c.trim() || "0").join(",")).join(";");
};

const parseRationalLikeToNumber = (raw: string): number | null => {
    const t = (raw ?? "").trim();
    if (!t) return 0;

    // plain number
    if (/^-?\d+(?:\.\d+)?$/.test(t)) {
        const n = Number(t);
        return Number.isFinite(n) ? n : null;
    }

    // a/b
    const frac = t.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (frac) {
        const n = Number(frac[1]);
        const d = Number(frac[2]);
        if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
        return n / d;
    }

    // \frac{a}{b} (optionally with a leading '-')
    const latexFrac = t.match(/^(-?)\\frac\{(-?\d+)\}\{(-?\d+)\}$/);
    if (latexFrac) {
        let n = Number(latexFrac[2]);
        const d = Number(latexFrac[3]);
        if (latexFrac[1] === "-") n = -n;
        if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
        return n / d;
    }

    return null;
};

const toNumericCsvFromCells = (data: string[][]): string | null => {
    const rows = data.map(row =>
        row.map(cell => {
            const n = parseRationalLikeToNumber(cell);
            return n === null ? null : String(n);
        })
    );
    if (rows.some(r => r.some(v => v === null))) return null;
    return (rows as string[][]).map(r => r.join(",")).join(";");
};

const toRationalCsvFromNumericCells = (data: string[][]): string | null => {
    const rows = data.map(row =>
        row.map(cell => numericTokenToRational(cell))
    );
    if (rows.some(r => r.some(v => v === null))) return null;
    return (rows as string[][]).map(r => r.join(",")).join(";");
};

const errorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return typeof error === "string" ? error : "";
};

interface ResultItem {
    label: string;
    value: string; // Plain text or CSV for saving
    latex: string; // LaTeX for display
    plainFactor?: string; // Standard plain text factor (for multiplication)
	kind?: string;
}

const formatResultToItems = (result: string, mode: LinalgOpMode): ResultItem[] => {
    if (mode === "eigenvalues") {
        const [valsPart, vecsPart] = result.split("|");
        const vals = valsPart.split(",");
        const items: ResultItem[] = vals.map((v, i) => ({
            label: `$\\lambda_{${i + 1}}$`,
            value: v,
            latex: `\\lambda_{${i + 1}} = ${v}`
        }));

        const isVecsEmpty = !vecsPart || vecsPart.replace(/;/g, "").trim() === "";
        if (!isVecsEmpty) {
            const rows = vecsPart.split(";").map(r => r.split(","));
            const nCols = rows[0]?.length || 0;
            for (let j = 0; j < nCols; j++) {
                const col = rows.map(r => r[j]);
                const colCsv = col.join(";");
                const colLatex = `\\begin{pmatrix} ${col.join(" \\\\ ")} \\end{pmatrix}`;
                items.push({
                    label: `$v_{${j + 1}}$`,
                    value: colCsv,
                    latex: `v_{${j + 1}} = ${colLatex}`,
                    kind: "linalg.vector",
                });
            }
        }
        return items;
    }

    if (mode === "lu" || mode === "qr" || mode === "svd") {
        const parts = result.split("|");
        const labelsMap: Record<string, string[]> = {
            lu: ["L", "U"],
            qr: ["Q", "R"],
            svd: ["U", "S", "V"]
        };
        const labels = labelsMap[mode];

        const items: ResultItem[] = [];
        for (let i = 0; i < labels.length; i++) {
            if (parts[i] && parts[i] !== "\\mathrm{NA}" && parts[i] !== "NA") {
                const label = `$${labels[i]}$`;
                items.push({
                    label,
                    value: parts[i],
                    latex: `${labels[i]} = ${matrixToLatex(parts[i])}`
                });
            }
        }
        return items;
    }

    // Default case (inv, add, mul, etc.)
    let factorLatex = "";
    let factorPlain = "";
    let matrixCsv = result;

    if (result.includes("#")) {
        const [fPart, mPart] = result.split("#");
        matrixCsv = mPart;
        if (fPart.includes("|")) {
            const [flatex, fplain] = fPart.split("|");
            factorLatex = flatex;
            factorPlain = fplain;
        } else {
            factorLatex = fPart;
            factorPlain = fPart;
        }
    }

    const labelMap: Record<string, string> = {
        inv: "$A^{-1}$",
        add: "$A + B$",
        mul: "$AB$"
    };
    const label = labelMap[mode] || "Result";
    const itemLatex = matrixToLatex(matrixCsv, factorLatex);

    return [{
        label,
        value: matrixCsv, // Clean CSV only
        latex: itemLatex,
        plainFactor: factorPlain || undefined
    }];
};

const matrixToLatex = (csv: string, factor?: string) => {
    if (!csv || csv === "NA" || csv === "\\mathrm{NA}") return "\\mathrm{NA}";
    const rows = csv.split(";").map(r => r.split(","));
    const latexRows = rows.map(r => r.join(" & ")).join(" \\\\ ");
    const matrixLatex = `\\begin{pmatrix} ${latexRows} \\end{pmatrix}`;

    return factor ? (factor === "1" ? matrixLatex : `${factor} ${matrixLatex}`) : matrixLatex;
};

export const LinalgSolverOperation = ({ mode, coeffType, group, startIndex = 1 }: Props) => {
    const [rowsA, setRowsA] = useState(2);
    const [colsA, setColsA] = useState(2);
    const [dataA, setDataA] = useState<string[][]>([["1", "0"], ["0", "1"]]);

    const [rowsB, setRowsB] = useState(2);
    const [colsB, setColsB] = useState(2);
    const [dataB, setDataB] = useState<string[][]>([["1", "0"], ["0", "1"]]);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [numericUnaryMethod, setNumericUnaryMethod] = useState<"numeric" | "exact">("numeric");
    const [verificationLatex, setVerificationLatex] = useState<string | null>(null);
    const [verificationItems, setVerificationItems] = useState<ResultItem[]>([]);

    const canSelectNumericMethod =
        group === "unary" &&
        coeffType === "numeric" &&
        (mode === "eigenvalues" || mode === "svd");

    const runCoeffType: LinalgCoeffType =
        canSelectNumericMethod && numericUnaryMethod === "exact"
            ? "rational"
            : coeffType;

    useEffect(() => {
        setResult(null);
        setVerificationLatex(null);
        setVerificationItems([]);
        setError(null);
        setWarning(null);
    }, [mode, group]);

    useEffect(() => {
        setNumericUnaryMethod("numeric");
    }, [mode, group, coeffType]);

    const performVerification = async (res: string, csvA: string) => {
        setVerificationLatex(null);
        setVerificationItems([]);
        if (runCoeffType !== "symbolic") return;

        // Strips any potential factors/metadata for pure matrix multiplication
        const strip = (s: string) => s.includes("#") ? s.split("#")[1] : s;

        try {
            const items: ResultItem[] = [];
            if (mode === "inv") {
                const resItems = formatResultToItems(res, mode);
                const item = resItems[0];
                let check;
                if (item.plainFactor) {
                    const prod = await LinalgApi.mulSymbolic(csvA, item.value);
                    check = await LinalgApi.mulSymbolic(item.plainFactor, strip(prod));
                } else {
                    check = await LinalgApi.mulSymbolic(csvA, item.value);
                }
                const checkStrip = strip(check);
                setVerificationLatex(`A \\times A^{-1} = I`);
                items.push({
                    label: "$A \\times A^{-1}$",
                    value: checkStrip,
                    latex: matrixToLatex(checkStrip)
                });
            } else if (mode === "lu") {
                const parts = res.split("|").map(strip);
                const l = parts[0];
                const u = parts[1];
                const prod = await LinalgApi.mulSymbolic(l, u);
                const prodStrip = strip(prod);
                setVerificationLatex(`A = LU`);
                items.push({
                    label: "$A$",
                    value: csvA,
                    latex: matrixToLatex(csvA)
                });
                items.push({
                    label: "$LU$",
                    value: prodStrip,
                    latex: matrixToLatex(prodStrip)
                });
            } else if (mode === "qr") {
                const parts = res.split("|").map(strip);
                const q = parts[0];
                const r = parts[1];
                const prod = await LinalgApi.mulSymbolicComplex(q, r);
                const prodStrip = strip(prod);
                setVerificationLatex(`A = QR`);
                items.push({
                    label: "$A$",
                    value: csvA,
                    latex: matrixToLatex(csvA)
                });
                items.push({
                    label: "$QR$",
                    value: prodStrip,
                    latex: matrixToLatex(prodStrip)
                });
            } else if (mode === "svd") {
                const parts = res.split("|").map(strip);
                const u = parts[0];
                const s = parts[1];
                const v = parts[2];
                if (u === "\\mathrm{NA}" || u === "NA") return;

                // U * S * V^H
                const vH = await LinalgApi.conjTransposeSymbolic(v);
                const sVh = await LinalgApi.mulSymbolicComplex(s, strip(vH));
                const usvh = await LinalgApi.mulSymbolicComplex(u, strip(sVh));
                const usvhStrip = strip(usvh);
                setVerificationLatex(`A = U S V^H`);
                items.push({
                    label: "$A$",
                    value: csvA,
                    latex: matrixToLatex(csvA)
                });
                items.push({
                    label: "$U S V^H$",
                    value: usvhStrip,
                    latex: matrixToLatex(usvhStrip)
                });
            } else if (mode === "eigenvalues") {
                const resItems = formatResultToItems(res, mode);
                const lam0 = resItems.find(it => it.label.includes("lambda"));
                const v0 = resItems.find(it => it.label.includes("v"));
                if (lam0 && v0) {
                    const av = await LinalgApi.mulSymbolicComplex(csvA, v0.value);
                    const lv = await LinalgApi.mulSymbolicComplex(lam0.value, v0.value);
                    const avStrip = strip(av);
                    const lvStrip = strip(lv);
                    setVerificationLatex(`A v_1 = \\lambda_1 v_1`);
                    items.push({
                        label: "$A v_1$",
                        value: avStrip,
                        latex: matrixToLatex(avStrip)
                    });
                    items.push({
                        label: "$\\lambda_1 v_1$",
                        value: lvStrip,
                        latex: matrixToLatex(lvStrip)
                    });
                }
            }
            setVerificationItems(items);
        } catch (e) {
            console.error("Verification failed", e);
        }
    };

    const toUserMessageFromAppError = (rawMessage: string) => {
        const appErr = tryParseAppErrorMessage(rawMessage);
        if (appErr?.code === AppErrorCodes.LinalgExactSizeLimit) {
            if (mode === "eigenvalues") {
                if (coeffType === "rational") {
                    return "厳密固有値は 4×4 まで対応です。サイズを 4 以下にするか、数値モードで計算してください（有理数→数値への変換も可能です）。";
                }
                return "厳密固有値は 4×4 まで対応です。サイズを 4 以下にするか、数値モードで入力してください。";
            }
            if (mode === "svd") {
                if (coeffType === "rational") {
                    return "厳密 SVD は列数 4 以下まで対応です。列数を 4 以下にするか、数値モードで計算してください（有理数→数値への変換も可能です）。";
                }
                return "厳密 SVD は列数 4 以下まで対応です。列数を 4 以下にするか、数値モードで入力してください。";
            }
        }

        return appErr?.message || String(rawMessage || "エラーが発生しました。");
    };

    const handleResizeA = (r: number, c: number) => {
        setRowsA(r); setColsA(c);
        setDataA(prev => Array.from({ length: r }, (_, i) =>
            Array.from({ length: c }, (_, j) => prev[i]?.[j] || "0")
        ));
    };

    const handleResizeB = (r: number, c: number) => {
        setRowsB(r); setColsB(c);
        setDataB(prev => Array.from({ length: r }, (_, i) =>
            Array.from({ length: c }, (_, j) => prev[i]?.[j] || "0")
        ));
    };

    const updateCellA = (r: number, c: number, v: string) => {
        const newData = [...dataA];
        newData[r] = [...(newData[r] || [])];
        newData[r][c] = v;
        setDataA(newData);
    };

    const updateCellB = (r: number, c: number, v: string) => {
        const newData = [...dataB];
        newData[r] = [...(newData[r] || [])];
        newData[r][c] = v;
        setDataB(newData);
    };

    const onRun = async () => {
        setLoading(true);
        setError(null);
        setWarning(null);
        setResult(null);

        try {
            // Type API classes are synchronous by design; wait for the single
            // application-level initialization here before using them.
            await ensureClientSdkReady();
            const csvA = toCsv(dataA);
            const csvB = toCsv(dataB);
            const runCsvA = runCoeffType === "rational" && coeffType === "numeric"
                ? toRationalCsvFromNumericCells(dataA)
                : csvA;
            const runCsvB = runCoeffType === "rational" && coeffType === "numeric"
                ? toRationalCsvFromNumericCells(dataB)
                : csvB;

            if (!runCsvA || (group === "binary" && !runCsvB)) {
                setError("厳密計算に変換できない値があります。数値のみ入力してください。");
                setLoading(false);
                return;
            }

            const runCsvBSafe = runCsvB ?? csvB;

            // Early guards for known exact-size limits to avoid freezing the UI.
            // Exact eigenvalues: only supported up to 4x4.
            if (mode === "eigenvalues" && runCoeffType !== "numeric") {
                if (rowsA !== colsA) {
                    setError("固有値は正方行列（行=列）のみ対応です。");
                    setLoading(false);
                    return;
                }
                if (rowsA > 4) {
                    if (runCoeffType === "rational") {
                        const numericCsvA = toNumericCsvFromCells(dataA);
                        if (!numericCsvA) {
                            setError("厳密固有値は 4×4 まで対応です。また、有理数を小数に変換できませんでした。a/b または \\frac{a}{b} 形式で入力してください。");
                            setLoading(false);
                            return;
                        }
                        const res = await LinalgApi.eigenvaluesNumeric(numericCsvA);
                        setWarning("厳密固有値は 4×4 までのため、有理数を小数に変換して数値固有値計算を実行しました。");
                        setResult(res);
                        setLoading(false);
                        return;
                    }

                    setError("厳密固有値（記号/厳密）は 4×4 まで対応です。サイズを 4 以下にするか、数値モードで入力してください。");
                    setLoading(false);
                    return;
                }
            }

            // Exact SVD (rational/symbolic): currently limited by the exact eigen solver of A^H A (size = cols).
            if (mode === "svd" && runCoeffType !== "numeric") {
                if (colsA > 4) {
                    if (runCoeffType === "rational") {
                        const numericCsvA = toNumericCsvFromCells(dataA);
                        if (!numericCsvA) {
                            setError("厳密SVDは列数 4 以下まで対応です。また、有理数を小数に変換できませんでした。a/b または \\frac{a}{b} 形式で入力してください。");
                            setLoading(false);
                            return;
                        }
                        const res = await LinalgApi.svdNumeric(numericCsvA);
                        setWarning("厳密SVDは列数 4 以下までのため、有理数を小数に変換して数値SVDを実行しました。");
                        setResult(res);
                        setLoading(false);
                        return;
                    }

                    setError("厳密SVD（記号/厳密）は列数 4 以下まで対応です。列数を 4 以下にするか、数値モードで入力してください。");
                    setLoading(false);
                    return;
                }
            }

            // Validation for numeric mode
            if (runCoeffType === "numeric") {
                const isNumeric = (csv: string) => csv.split(/[,\n;]/).every(s => s.trim() === "" || !isNaN(parseFloat(s.trim())) && isFinite(Number(s.trim())));
                if (!isNumeric(csvA) || (group === "binary" && !isNumeric(csvB))) {
                    setError("数値計算モードですが、無効な数値が含まれています。記号や文字が含まれていないか確認してください。");
                    setLoading(false);
                    return;
                }
            }

            let res = "";

            if (mode === "eigenvalues") {
                if (runCoeffType === "numeric") {
                    res = await LinalgApi.eigenvaluesNumeric(csvA);
                } else if (runCoeffType === "rational") {
                    try {
                        res = await LinalgApi.eigenvaluesRational(runCsvA);
                    } catch (e: unknown) {
                        const appErr = tryParseAppErrorMessage(errorMessage(e));
                        if (appErr?.code === AppErrorCodes.LinalgExactSizeLimit) {
                            const numericCsvA = toNumericCsvFromCells(dataA);
                            if (!numericCsvA) {
                                throw new Error("有理数を小数に変換できませんでした。a/b または \\frac{a}{b} 形式で入力してください。");
                            }
                            res = await LinalgApi.eigenvaluesNumeric(numericCsvA);
                            setWarning("有理数を小数に変換して数値固有値計算を実行しました（厳密固有値は 4×4 まで）。");
                        } else {
                            throw e;
                        }
                    }
                } else {
                    res = await LinalgApi.eigenvaluesSymbolic(runCsvA);
                }
            } else if (mode === "inv") {
                if (runCoeffType === "numeric") {
                    res = await LinalgApi.invNumeric(csvA);
                } else if (runCoeffType === "rational") {
                    const matrix = rationalMatrixDtoFromCells(dataA);
                    if (!matrix) {
                        throw new Error("有理数を DTO に変換できませんでした。整数、a/b、小数、または \\frac{a}{b} 形式で入力してください。");
                    }
                    res = rationalMatrixDtoToCsv(
                        RationalMatrixDto.fromDto(matrix).inverse().toDto()
                    );
                } else {
                    res = await LinalgApi.invSymbolic(runCsvA);
                }
            } else if (mode === "lu") {
                if (runCoeffType === "numeric") res = await LinalgApi.luNumeric(csvA);
                else if (runCoeffType === "rational") res = await LinalgApi.luRational(runCsvA);
                else res = await LinalgApi.luSymbolic(runCsvA);
            } else if (mode === "qr") {
                if (runCoeffType === "numeric") res = await LinalgApi.qrNumeric(csvA);
                else if (runCoeffType === "rational") res = await LinalgApi.qrRational(runCsvA);
                else res = await LinalgApi.qrSymbolic(runCsvA);
            } else if (mode === "svd") {
                if (runCoeffType === "numeric") res = await LinalgApi.svdNumeric(csvA);
                else if (runCoeffType === "rational") {
                    try {
                        res = await LinalgApi.svdRational(runCsvA);
                    } catch (e: unknown) {
                        const appErr = tryParseAppErrorMessage(errorMessage(e));
                        if (appErr?.code === AppErrorCodes.LinalgExactSizeLimit) {
                            const numericCsvA = toNumericCsvFromCells(dataA);
                            if (!numericCsvA) {
                                throw new Error("有理数を小数に変換できませんでした。a/b または \\frac{a}{b} 形式で入力してください。");
                            }
                            res = await LinalgApi.svdNumeric(numericCsvA);
                            setWarning("有理数を小数に変換して数値SVDを実行しました（厳密SVDは列数 4 以下まで）。");
                        } else {
                            throw e;
                        }
                    }
                }
                else res = await LinalgApi.svdSymbolic(runCsvA);
            } else if (mode === "add") {
                if (runCoeffType === "numeric") {
                    res = await LinalgApi.addNumeric(csvA, csvB);
                } else if (runCoeffType === "rational") {
                    const matrixA = rationalMatrixDtoFromCells(dataA);
                    const matrixB = rationalMatrixDtoFromCells(dataB);
                    if (!matrixA || !matrixB) {
                        throw new Error("有理数を DTO に変換できませんでした。整数、a/b、小数、または \\frac{a}{b} 形式で入力してください。");
                    }
                    res = rationalMatrixDtoToCsv(
                        RationalMatrixDto.fromDto(matrixA)
                            .add(RationalMatrixDto.fromDto(matrixB))
                            .toDto()
                    );
                } else {
                    res = await LinalgApi.addSymbolic(runCsvA, runCsvBSafe);
                }
            } else if (mode === "mul") {
                if (runCoeffType === "numeric") {
                    res = await LinalgApi.mulNumeric(csvA, csvB);
                } else if (runCoeffType === "rational") {
                    const matrixA = rationalMatrixDtoFromCells(dataA);
                    const matrixB = rationalMatrixDtoFromCells(dataB);
                    if (!matrixA || !matrixB) {
                        throw new Error("有理数を DTO に変換できませんでした。整数、a/b、小数、または \\frac{a}{b} 形式で入力してください。");
                    }
                    res = rationalMatrixDtoToCsv(
                        RationalMatrixDto.fromDto(matrixA)
                            .mul(RationalMatrixDto.fromDto(matrixB))
                            .toDto()
                    );
                } else {
                    res = await LinalgApi.mulSymbolic(runCsvA, runCsvBSafe);
                }
            } else {
                setError("未実装の演算です。");
                setLoading(false);
                return;
            }

            if (mode === "svd") {
                const warnPart = res
                    .split("|")
                    .find(p => p.startsWith("WARN:"));
                if (warnPart) {
                    setWarning(warnPart.replace(/^WARN:/, ""));
                }
            }

            setResult(res);
            await performVerification(res, csvA);
        } catch (e: unknown) {
            const message = errorMessage(e);
            const appErr = tryParseAppErrorMessage(message);
            if (appErr?.code === AppErrorCodes.LinalgExactSizeLimit) {
                // Expected limitation: don't treat as a hard error in logs.
                console.warn(appErr);
            } else {
                console.error(e);
            }
            setError(toUserMessageFromAppError(message || "エラーが発生しました。"));
        }
        setLoading(false);
    };

    const modeLabelMap: Record<string, string> = {
        inv: "逆行列",
        eigenvalues: "固有値分解",
        lu: "LU分解",
        qr: "QR分解",
        svd: "特異値分解 (SVD)",
        add: "行列加算",
        mul: "行列乗算",
    };

    const modeDescMap: Record<string, string> = {
        inv: "入力行列の逆行列を計算します。",
        eigenvalues: "固有値と固有ベクトル（対応可能範囲）を計算します。",
        lu: "行列を下三角行列 L と上三角行列 U に分解します。",
        qr: "行列を直交行列 Q と上三角行列 R に分解します。",
        svd: "行列を U, S, V に分解し、特異値構造を確認します。",
        add: "2つの行列を要素ごとに加算します。",
        mul: "2つの行列を積として計算します。",
    };

    const coeffLabel = coeffType === "numeric" ? "数値" : coeffType === "rational" ? "有理数" : "記号";
    const settingBlock = startIndex > 1 ? undefined : (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">行列演算</Text>
            <Text variant="detail" color="secondary">{modeDescMap[mode] ?? "行列演算を実行します。"}</Text>
            <Text variant="xs" color="secondary">
                演算: {modeLabelMap[mode] ?? mode} / 入力構成: {group === "binary" ? "二項" : "単項"} / 係数型: {coeffLabel}
            </Text>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="sm">
            <MatrixInput
                label="行列 $A$"
                rows={rowsA} cols={colsA}
                data={dataA}
                onChange={updateCellA}
                onResize={handleResizeA}
                coeffType={coeffType}
            />

            {group === "binary" && (
                <MatrixInput
                    label="行列 $B$"
                    rows={rowsB} cols={colsB}
                    data={dataB}
                    onChange={updateCellB}
                    onResize={handleResizeB}
                    coeffType={coeffType}
                />
            )}
        </Stack>
    );

    const actionBlock = (
        <Stack gap="sm">
            {canSelectNumericMethod ? (
                <Flex justify="center" className="items-center gap-2 flex-wrap">
                    <Text weight="semibold" className="text-slate-600 dark:text-slate-400">解法:</Text>
                    <Stack direction="row" gap="xs" className="items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-600">
                        <Button
                            size="sm"
                            variant={numericUnaryMethod === "numeric" ? "solid" : "ghost"}
                            onClick={() => setNumericUnaryMethod("numeric")}
                            className={numericUnaryMethod === "numeric" ? "bg-white text-slate-800 shadow" : "text-slate-500"}
                        >
                            数値計算
                        </Button>
                        <Button
                            size="sm"
                            variant={numericUnaryMethod === "exact" ? "solid" : "ghost"}
                            onClick={() => setNumericUnaryMethod("exact")}
                            className={numericUnaryMethod === "exact" ? "bg-white text-slate-800 shadow" : "text-slate-500"}
                        >
                            厳密計算
                        </Button>
                    </Stack>
                </Flex>
            ) : null}
            <Flex justify="center" className="py-2">
                <Button onClick={onRun} disabled={loading} className="px-8 shadow-md">
                    {loading ? "計算中..." : "計算する"}
                </Button>
            </Flex>
            {error && <Text className="text-red-500 text-center font-medium mt-2">{error}</Text>}
            {warning && <Text className="text-amber-600 dark:text-amber-400 text-center font-medium mt-2">{warning}</Text>}
        </Stack>
    );

    const outputBlock =
        result !== null ? (
            <Stack gap="md">
                <Stack gap="md">
                    {formatResultToItems(result, mode).map((item, idx) => (
                        <Stack key={idx} gap="xs" className="bg-white dark:bg-slate-900 p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800">
                            <Flex align="center" justify="between">
                                <View className="font-mono font-bold text-slate-600 dark:text-slate-400">
                                    <Markdown>{item.label}</Markdown>
                                </View>
                                <Flex align="center" gap="xs">
                                    <SaveVariableIconButton
							kind={item.kind ?? "linalg.matrix"}
                                        value={item.value}
                                        suggestedName={item.label.replace(/[^a-zA-Z0-9]/g, '_')}
                                        variant="solid"
                                        color="primary"
                                        size="sm"
                                    />
                                    <CopyIconButton
                                        text={item.value}
                                        variant="solid"
                                        color="primary"
                                        size="sm"
                                    />
                                </Flex>
                            </Flex>
                            <View className="overflow-x-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                                <Markdown className="text-2xl py-2">{`$$${item.latex}$$`}</Markdown>
                            </View>
                        </Stack>
                    ))}
                    {mode === "eigenvalues" && (!result.split("|")[1] || result.split("|")[1].replace(/;/g, "").trim() === "") && (
                        <Text variant="detail" className="text-slate-500 italic px-2">
                            ※ 3次以上の記号行列では固有ベクトルを省略しています。
                        </Text>
                    )}
                </Stack>
            </Stack>
        ) : (
            <Text color="muted">実行すると結果がここに表示されます。</Text>
        );

    const verificationBlock =
        verificationLatex ? (
            <View bg="muted" rounded="lg" padding="lg" className="bg-opacity-20 border border-slate-200 dark:border-slate-800">
                <Stack gap="lg">
                    <View className="overflow-x-auto py-2">
                        <Markdown className="text-2xl text-center">
                            {`$$ ${verificationLatex} $$`}
                        </Markdown>
                    </View>

                    {verificationItems.length > 0 && <Divider />}

                    <Stack gap="md">
                        {verificationItems.map((item, idx) => (
                            <Stack key={idx} gap="xs" className="bg-white dark:bg-slate-900 p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800">
                                <Flex align="center" justify="between">
                                    <View className="font-mono font-bold text-slate-600 dark:text-slate-400">
                                        <Markdown>{item.label}</Markdown>
                                    </View>
                                    <Flex align="center" gap="xs">
                                        <SaveVariableIconButton
							kind={item.kind ?? "linalg.matrix"}
                                            value={item.value}
                                            suggestedName={item.label.replace(/[^a-zA-Z0-9]/g, '_')}
                                            variant="solid"
                                            color="primary"
                                            size="sm"
                                        />
                                        <CopyIconButton
                                            text={item.value}
                                            variant="solid"
                                            color="primary"
                                            size="sm"
                                        />
                                    </Flex>
                                </Flex>
                                <View className="overflow-x-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <Markdown className="text-2xl py-2">{`$$${item.latex}$$`}</Markdown>
                                </View>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </View>
        ) : undefined;

    return <UnaryOperationLayout setting={settingBlock} input={inputBlock} action={actionBlock} output={outputBlock} verification={verificationBlock} startIndex={startIndex} />;
};
