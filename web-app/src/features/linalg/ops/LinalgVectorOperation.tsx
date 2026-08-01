"use client";
import { useEffect, useState } from "react";
import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Button } from "../../../design/baseComponents/Button";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { View } from "../../../design/primitives/View";
import { LinalgApi } from "@my-project/client-sdk";

import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";

import type { LinalgCoeffType } from "../LinalgOperations";
import { MatrixInput } from "../ui/MatrixInput";
import { VectorInput } from "../ui/VectorInput";

export type LinalgVectorOpMode = "mulVec" | "solve";

type Props = {
	mode: LinalgVectorOpMode;
	coeffType: LinalgCoeffType;
	startIndex?: number;
};

const toCsvMatrix = (data: string[][]) => data.map((row) => row.map((c) => c.trim() || "0").join(",")).join(";");
const toCsvVector = (data: string[]) => data.map((c) => c.trim() || "0").join(";");

const isNumericCsv = (csv: string) =>
	csv.split(/[;,\n]/).every((s) => s.trim() === "" || (!isNaN(parseFloat(s.trim())) && isFinite(Number(s.trim()))));

const matrixToLatex = (csv: string) => {
	if (!csv || csv === "NA" || csv === "\\mathrm{NA}") return "\\mathrm{NA}";
	const rows = csv.split(";").map((r) => r.split(","));
	const latexRows = rows.map((r) => r.join(" & ")).join(" \\\\ ");
	return `\\begin{pmatrix} ${latexRows} \\end{pmatrix}`;
};

export const LinalgVectorOperation = ({ mode, coeffType, startIndex = 1 }: Props) => {
	const [rowsA, setRowsA] = useState(2);
	const [colsA, setColsA] = useState(2);
	const [dataA, setDataA] = useState<string[][]>([
		["1", "0"],
		["0", "1"],
	]);

	const [dimV, setDimV] = useState(2);
	const [vecV, setVecV] = useState<string[]>(["1", "1"]);

	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setResult(null);
		setError(null);
	}, [mode, coeffType]);

	useEffect(() => {
		const targetDim = mode === "mulVec" ? colsA : rowsA;
		setDimV(targetDim);
		setVecV((prev) => Array.from({ length: targetDim }, (_, i) => prev[i] ?? "0"));
	}, [mode, rowsA, colsA]);

	const handleResizeA = (r: number, c: number) => {
		setRowsA(r);
		setColsA(c);
		setDataA((prev) =>
			Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => prev[i]?.[j] || "0"))
		);
	};

	const updateCellA = (r: number, c: number, v: string) => {
		setDataA((prev) => {
			const next = [...prev];
			next[r] = [...(next[r] || [])];
			next[r][c] = v;
			return next;
		});
	};

	const handleResizeV = (n: number) => {
		setDimV(n);
		setVecV((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? "0"));
	};

	const updateCellV = (i: number, v: string) => {
		setVecV((prev) => {
			const next = [...prev];
			next[i] = v;
			return next;
		});
	};

	const onRun = async () => {
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const csvA = toCsvMatrix(dataA);
			const csvV = toCsvVector(vecV);

			if (coeffType === "numeric") {
				if (!isNumericCsv(csvA) || !isNumericCsv(csvV)) {
					setError("数値計算モードですが、無効な数値が含まれています。記号や文字が含まれていないか確認してください。");
					setLoading(false);
					return;
				}
			}

			let out = "";
			if (mode === "mulVec") {
				if (coeffType === "numeric") out = await LinalgApi.mulVectorNumeric(csvA, csvV);
				else if (coeffType === "rational") out = await LinalgApi.mulVectorRational(csvA, csvV);
				else out = await LinalgApi.mulVectorSymbolic(csvA, csvV);
			} else {
				if (coeffType === "numeric") out = await LinalgApi.solveVectorNumeric(csvA, csvV);
				else if (coeffType === "rational") out = await LinalgApi.solveVectorRational(csvA, csvV);
				else out = await LinalgApi.solveVectorSymbolic(csvA, csvV);
			}

			setResult(out);
		} catch (e: unknown) {
			console.error(e);
			const message = e instanceof Error ? e.message : String(e);
			setError(message || "エラーが発生しました。");
		}

		setLoading(false);
	};

	const vectorLabel = mode === "mulVec" ? "ベクトル $v$" : "ベクトル $b$";
	const outputLabel = mode === "mulVec" ? "$A v$" : "$x$";
	const modeLabel = mode === "mulVec" ? "行列×ベクトル" : "連立一次方程式";
	const coeffLabel =
		coeffType === "numeric" ? "数値" : coeffType === "rational" ? "有理数" : "記号";

	const settingBlock = startIndex > 1 ? undefined : (
		<Stack gap="sm">
			<Text weight="semibold" variant="detail">ベクトル演算</Text>
			<Text variant="detail" color="secondary">
				行列 $A$ とベクトルを入力して、$Av$ または $Ax=b$ を解きます。
			</Text>
			<Text variant="xs" color="secondary">
				モード: {modeLabel} / 係数型: {coeffLabel}
			</Text>
		</Stack>
	);

	const inputBlock = (
		<Stack gap="sm">
			<MatrixInput
				label="行列 $A$"
				rows={rowsA}
				cols={colsA}
				data={dataA}
				onChange={updateCellA}
				onResize={handleResizeA}
				coeffType={coeffType}
			/>
			<VectorInput
				label={vectorLabel}
				dim={dimV}
				data={vecV}
				onChange={updateCellV}
				onResize={handleResizeV}
				coeffType={coeffType}
			/>
		</Stack>
	);

	const actionBlock = (
		<Stack gap="sm">
			<Flex justify="center" className="py-2">
				<Button onClick={onRun} disabled={loading} className="px-8 shadow-md">
					{loading ? "計算中..." : "計算する"}
				</Button>
			</Flex>
			{error && <Text className="text-red-500 text-center font-medium mt-2">{error}</Text>}
		</Stack>
	);

	const outputBlock =
		result !== null ? (
			<Stack gap="md">
				<Stack gap="xs" className="bg-white dark:bg-slate-900 p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800">
					<Flex align="center" justify="between">
						<View className="font-mono font-bold text-slate-600 dark:text-slate-400">
							<Markdown>{outputLabel}</Markdown>
						</View>
						<Flex align="center" gap="xs">
							<SaveVariableIconButton kind="linalg.vector" value={result} suggestedName={mode === "solve" ? "x" : "Av"} variant="solid" color="primary" size="sm" />
							<CopyIconButton text={result} variant="solid" color="primary" size="sm" />
						</Flex>
					</Flex>
					<View className="overflow-x-auto pt-4 border-t border-slate-50 dark:border-slate-800">
						<Markdown className="text-2xl py-2">{`$$${matrixToLatex(result)}$$`}</Markdown>
					</View>
				</Stack>
			</Stack>
		) : (
			<Text color="muted">実行すると結果がここに表示されます。</Text>
		);

	return (
		<UnaryOperationLayout setting={settingBlock} input={inputBlock} action={actionBlock} output={outputBlock} startIndex={startIndex} />
	);
};
