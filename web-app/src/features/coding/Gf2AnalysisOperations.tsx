"use client";

import { useMemo, useState } from "react";
import { Stack } from "../../design/primitives/Stack";
import { Flex } from "../../design/primitives/Flex";
import { Text } from "../../design/baseComponents/Text";
import { Select } from "../../design/baseComponents/Select";
import { FormField } from "../../design/baseComponents/FormField";
import { Input } from "../../design/baseComponents/Input";
import { Button } from "../../design/baseComponents/Button";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { CodingApi } from "@my-project/client-sdk";
import { parseBits01 } from "../../shared/utils/bits";
import { codingErrorToDisplayMessage } from "./config/errorCodeMessages";
import { GeneratorPolynomialBitsInput } from "./components/GeneratorPolynomialBitsInput";
import { VariablePickerIconButton } from "../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../shared/variable-manager/SaveVariableIconButton";
import { CopyIconButton } from "../../shared/ui/CopyIconButton";

const gf2Kinds = {
	paramN: "coding.gf2.param.n",
	polyGBits: "coding.gf2.poly.gBits",
	matrix: "coding.gf2.matrix",
	bitsR: "coding.gf2.bits.r",
	bitsRBatch: "coding.gf2.bits.rBatch",
	bitsSyndrome: "coding.gf2.bits.syndrome",
	bitsSyndromeBatch: "coding.gf2.bits.syndromeBatch",
	checkGhZero: "coding.gf2.check.GHtZero",
} as const;

type Gf2Kind = (typeof gf2Kinds)[keyof typeof gf2Kinds];

type Gf2Matrix = {
	rows: number;
	cols: number;
	data: Uint8Array; // row-major (0/1)
};

const splitRows = (raw: string): string[] =>
	raw
		.split(/;|\n|\r/g)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

const splitCols = (raw: string): string[] =>
	raw
		.split(/,|\s|\t/g)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

function parseGf2MatrixCsv(csv: string): Gf2Matrix {
	const trimmed = csv.trim();
	if (!trimmed) throw new Error("Input is empty");
	const rowsRaw = splitRows(trimmed);
	if (rowsRaw.length === 0) throw new Error("Matrix has no rows");
	const rowTokens = rowsRaw.map(splitCols);
	const cols = rowTokens[0]?.length ?? 0;
	if (cols === 0) throw new Error("Matrix is empty");
	for (const r of rowTokens) {
		if (r.length !== cols) throw new Error("Inconsistent column count in matrix");
	}
	const rows = rowTokens.length;
	const data = new Uint8Array(rows * cols);
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const v = rowTokens[i][j];
			if (v !== "0" && v !== "1") throw new Error(`Invalid GF(2) entry: ${v}`);
			data[i * cols + j] = v === "1" ? 1 : 0;
		}
	}
	return { rows, cols, data };
}

function matrixToCsv(mat: Gf2Matrix): string {
	const out: string[] = [];
	for (let i = 0; i < mat.rows; i++) {
		const row: string[] = [];
		for (let j = 0; j < mat.cols; j++) row.push(String(mat.data[i * mat.cols + j] & 1));
		out.push(row.join(","));
	}
	return out.join(";");
}

function zeroMatrixCsv(rows: number, cols: number): string {
	if (rows <= 0 || cols <= 0) return "";
	const row = Array.from({ length: cols }, () => "0").join(",");
	return Array.from({ length: rows }, () => row).join(";");
}

const popcount32 = (x: number): number => {
	let v = x >>> 0;
	v = v - ((v >>> 1) & 0x55555555);
	v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
};

function rankGf2(mat: Gf2Matrix): number {
	const { rows, cols, data } = mat;
	const words = Math.ceil(cols / 32);
	const rowWords: Uint32Array[] = new Array(rows);
	for (let i = 0; i < rows; i++) {
		const w = new Uint32Array(words);
		for (let j = 0; j < cols; j++) {
			if (data[i * cols + j] & 1) {
				w[j >>> 5] |= 1 << (j & 31);
			}
		}
		rowWords[i] = w;
	}

	let rank = 0;
	let pivotRow = 0;
	for (let col = 0; col < cols && pivotRow < rows; col++) {
		const wordIndex = col >>> 5;
		const mask = 1 << (col & 31);
		let sel = -1;
		for (let r = pivotRow; r < rows; r++) {
			if ((rowWords[r][wordIndex] & mask) !== 0) {
				sel = r;
				break;
			}
		}
		if (sel < 0) continue;
		if (sel !== pivotRow) {
			const tmp = rowWords[pivotRow];
			rowWords[pivotRow] = rowWords[sel];
			rowWords[sel] = tmp;
		}
		for (let r = 0; r < rows; r++) {
			if (r === pivotRow) continue;
			if ((rowWords[r][wordIndex] & mask) === 0) continue;
			for (let w = 0; w < words; w++) {
				rowWords[r][w] ^= rowWords[pivotRow][w];
			}
		}
		pivotRow++;
		rank++;
	}
	return rank;
}

function mulGf2WithTranspose(a: Gf2Matrix, b: Gf2Matrix): Gf2Matrix {
	if (a.cols !== b.cols) throw new Error("G と H の列数（n）が一致している必要があります");
	const words = Math.ceil(a.cols / 32);

	const aRows: Uint32Array[] = new Array(a.rows);
	for (let i = 0; i < a.rows; i++) {
		const w = new Uint32Array(words);
		for (let j = 0; j < a.cols; j++) if (a.data[i * a.cols + j] & 1) w[j >>> 5] |= 1 << (j & 31);
		aRows[i] = w;
	}
	const bRows: Uint32Array[] = new Array(b.rows);
	for (let i = 0; i < b.rows; i++) {
		const w = new Uint32Array(words);
		for (let j = 0; j < b.cols; j++) if (b.data[i * b.cols + j] & 1) w[j >>> 5] |= 1 << (j & 31);
		bRows[i] = w;
	}

	const out: Gf2Matrix = { rows: a.rows, cols: b.rows, data: new Uint8Array(a.rows * b.rows) };
	for (let i = 0; i < a.rows; i++) {
		for (let j = 0; j < b.rows; j++) {
			let parity = 0;
			for (let w = 0; w < words; w++) {
				parity ^= popcount32(aRows[i][w] & bRows[j][w]) & 1;
			}
			out.data[i * out.cols + j] = parity & 1;
		}
	}
	return out;
}

const formatMatrixInfo = (csv: string, role: "G" | "H" | "Other"): string | null => {
	try {
		if (!csv.trim()) return null;
		const m = parseGf2MatrixCsv(csv);
		const r = rankGf2(m);
		if (role === "G") {
			const n = m.cols;
			const k = m.rows;
			return `サイズ: ${m.rows}×${m.cols} / 推定ランク: ${r} / (n,k)=(${n},${k})`;
		}
		if (role === "H") {
			const n = m.cols;
			const estK = n - r;
			return `サイズ: ${m.rows}×${m.cols} / 推定ランク: ${r} / 推定(n,k)=(${n},${estK})`;
		}
		return `サイズ: ${m.rows}×${m.cols} / 推定ランク: ${r}`;
	} catch {
		return null;
	}
};

type TextInputWithVarButtonsProps = {
	label: string;
	kind: Gf2Kind;
	value: string;
	onChange: (next: string) => void;
	suggestedName: string;
	disabled?: boolean;
	multiline?: boolean;
	rows?: number;
	placeholder?: string;
	helpText?: string;
};

const TextInputWithVarButtons = ({
	label,
	kind,
	value,
	onChange,
	suggestedName,
	disabled,
	multiline,
	rows,
	placeholder,
	helpText,
}: TextInputWithVarButtonsProps) => {
	const isEmpty = value.trim().length === 0;
	return (
		<Stack gap="xs">
			<Flex align="center" justify="between">
				<Text variant="detail">{label}</Text>
				<Flex align="center" gap="xs">
					<VariablePickerIconButton kind={kind} disabled={disabled} onPick={(e) => onChange(e.value)} />
					<SaveVariableIconButton kind={kind} value={value} suggestedName={suggestedName} disabled={disabled || isEmpty} />
					<CopyIconButton text={value} disabled={disabled || isEmpty} />
				</Flex>
			</Flex>
			{helpText ? (
				<Text variant="xs" color="muted">
					{helpText}
				</Text>
			) : null}
			<Input
				multeline={!!multiline}
				rows={rows}
				className="font-mono"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
			/>
		</Stack>
	);
};

type TextOutputWithButtonsProps = {
	label: string;
	kind: Gf2Kind;
	value: string;
	suggestedName: string;
	infoText?: string | null;
};

const TextOutputWithButtons = ({ label, kind, value, suggestedName, infoText }: TextOutputWithButtonsProps) => {
	const isEmpty = value.trim().length === 0;
	return (
		<Stack gap="xs">
			<Flex align="center" justify="between">
				<Text weight="bold">{label}</Text>
				<Flex align="center" gap="xs">
					<SaveVariableIconButton kind={kind} value={value} suggestedName={suggestedName} disabled={isEmpty} />
					<CopyIconButton text={value} disabled={isEmpty} />
				</Flex>
			</Flex>
			{infoText ? (
				<Text variant="xs" color="secondary">
					{infoText}
				</Text>
			) : null}
			<Input multeline rows={8} readOnly className="font-mono" value={value} placeholder="ここに結果が表示されます" />
		</Stack>
	);
};

type Tool = "cyclicG" | "cyclicH" | "hFromG" | "syndrome" | "syndromeBatch" | "ghCheck";

const toolLabel: Record<Tool, string> = {
	cyclicG: "Cyclic: 生成行列 G を作る",
	cyclicH: "Cyclic: 検査行列 H を作る",
	hFromG: "G → H（生成行列から検査行列）",
	syndrome: "シンドローム s = H r^T",
	syndromeBatch: "シンドローム（バッチ）: s_i = H r_i^T",
	ghCheck: "整合性チェック: G H^T = 0 を検証",
};

export const Gf2AnalysisOperations = () => {
	const [tool, setTool] = useState<Tool>("cyclicG");

	const [n, setN] = useState("7");
	const [gBits, setGBits] = useState("1,1,0,1");

	const [gCsv, setGCsv] = useState("1,0,0,0,1,1,0;0,1,0,0,0,1,1;0,0,1,0,1,0,1");
	const [hCsv, setHCsv] = useState("1,1,1,0,1,0,0;1,1,0,1,0,1,0;1,0,1,1,0,0,1;0,1,1,1,0,0,0");
	const [rBits, setRBits] = useState("1,0,1,1,0,0,1");
	const [rBatch, setRBatch] = useState("1,0,1,1,0,0,1\n1,0,1,1,0,0,0");

	const [outMatrixG, setOutMatrixG] = useState<string>("");
	const [outMatrixH, setOutMatrixH] = useState<string>("");
	const [outSyndrome, setOutSyndrome] = useState<string>("");
	const [outSyndromeBatch, setOutSyndromeBatch] = useState<string>("");
	const [outGhCheck, setOutGhCheck] = useState<string>("");
	const [outGhExpected, setOutGhExpected] = useState<string>("");
	const [outGhProduct, setOutGhProduct] = useState<string>("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const inputError = useMemo(() => {
		try {
			if (tool === "cyclicG" || tool === "cyclicH") {
				const nn = Number(n);
				if (!Number.isInteger(nn) || nn <= 0) return "n は正の整数で指定してください";
				const g = parseBits01(gBits);
				if (g.length === 0) return "g(x) を入力してください";
				return null;
			}
			if (tool === "hFromG") {
				if (gCsv.trim().length === 0) return "G の CSV を入力してください";
				// validate parse
				parseGf2MatrixCsv(gCsv);
				return null;
			}
			if (tool === "syndrome") {
				if (hCsv.trim().length === 0) return "H の CSV を入力してください";
				if (rBits.trim().length === 0) return "r を入力してください";
				parseGf2MatrixCsv(hCsv);
				parseBits01(rBits);
				return null;
			}
			if (tool === "syndromeBatch") {
				if (hCsv.trim().length === 0) return "H の CSV を入力してください";
				if (rBatch.trim().length === 0) return "r のバッチ入力をしてください";
				parseGf2MatrixCsv(hCsv);
				const lines = splitRows(rBatch);
				if (lines.length === 0) return "r のバッチ入力が空です";
				for (const line of lines) parseBits01(line);
				return null;
			}
			if (tool === "ghCheck") {
				if (gCsv.trim().length === 0) return "G の CSV を入力してください";
				if (hCsv.trim().length === 0) return "H の CSV を入力してください";
				parseGf2MatrixCsv(gCsv);
				parseGf2MatrixCsv(hCsv);
				return null;
			}
			return null;
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	}, [tool, n, gBits, gCsv, hCsv, rBits, rBatch]);

	const canRun = !loading && !inputError;

	async function onRun() {
		setLoading(true);
		setError(null);
		try {
			if (tool === "cyclicG") {
				const nn = Number(n);
				const g = parseBits01(gBits);
				const res = await CodingApi.gf2CyclicGeneratorMatrix(nn, g);
				setOutMatrixG(res);
			} else if (tool === "cyclicH") {
				const nn = Number(n);
				const g = parseBits01(gBits);
				const res = await CodingApi.gf2CyclicParityCheckMatrix(nn, g);
				setOutMatrixH(res);
			} else if (tool === "hFromG") {
				const res = await CodingApi.gf2ParityCheckFromGeneratorMatrix(gCsv);
				setOutMatrixH(res);
			} else if (tool === "syndrome") {
				const res = await CodingApi.gf2Syndrome(hCsv, rBits);
				setOutSyndrome(res);
			} else if (tool === "syndromeBatch") {
				const lines = splitRows(rBatch);
				const out = await Promise.all(lines.map((line) => CodingApi.gf2Syndrome(hCsv, line)));
				setOutSyndromeBatch(out.join("\n"));
			} else {
				const gMat = parseGf2MatrixCsv(gCsv);
				const hMat = parseGf2MatrixCsv(hCsv);
				setOutGhExpected(zeroMatrixCsv(gMat.rows, hMat.rows));
				const prod = mulGf2WithTranspose(gMat, hMat);
				const prodCsv = matrixToCsv(prod);
				setOutGhProduct(prodCsv);
				const ok = prod.data.every((v) => (v & 1) === 0);
				setOutGhCheck(ok ? "OK: GH^T = 0" : "NG: GH^T ≠ 0（1 が含まれます）");
			}
		} catch (e) {
			setError(codingErrorToDisplayMessage(e));
		} finally {
			setLoading(false);
		}
	}

	const toolSelect = (
		<FormField label="ツール">
			<Select
				value={tool}
				onChange={(e) => setTool(e.target.value as Tool)}
				options={(Object.keys(toolLabel) as Tool[]).map((k) => ({ label: toolLabel[k], value: k }))}
			/>
		</FormField>
	);

	const formatHint = (
		<Text variant="xs" color="secondary">
			CSV 形式: 行区切りは `;` または改行、列区切りは `,`（空白/タブも可）。要素は 0/1。
		</Text>
	);

	const settingBlock = (
		<Stack gap="sm">
			<Text weight="semibold" variant="detail">GF(2) 解析ツール</Text>
			<Text variant="detail" color="secondary">
				生成行列/検査行列の構成、シンドローム計算、$GH^T=0$ の整合性検証を行います。
			</Text>
			{toolSelect}
			{formatHint}
		</Stack>
	);

	const inputBlock = (
		<Stack gap="md">
			{(tool === "cyclicG" || tool === "cyclicH") && (
				<Stack gap="md">
					<TextInputWithVarButtons
						label="n（コード長）"
						kind={gf2Kinds.paramN}
						value={n}
						onChange={setN}
						suggestedName="n"
						disabled={loading}
						placeholder="例: 7"
					/>
					<GeneratorPolynomialBitsInput
						label="g(x)（低次→高次の 0/1）"
						value={gBits}
						onChange={setGBits}
						disabled={loading}
						required
						kind={gf2Kinds.polyGBits}
						suggestedName="g_bits"
						helpText="定数項→高次の順に 0/1。例: 1,1,0,1"
					/>
				</Stack>
			)}

			{tool === "hFromG" && (
				<TextInputWithVarButtons
					label="G（生成行列, CSV）"
					kind={gf2Kinds.matrix}
					value={gCsv}
					onChange={setGCsv}
					suggestedName="G"
					disabled={loading}
					multiline
					rows={6}
					placeholder="例: 1,0,1;0,1,1"
				/>
			)}

			{tool === "syndrome" && (
				<Stack gap="md">
					<TextInputWithVarButtons
						label="H（検査行列, CSV）"
						kind={gf2Kinds.matrix}
						value={hCsv}
						onChange={setHCsv}
						suggestedName="H"
						disabled={loading}
						multiline
						rows={6}
						placeholder="例: 1,0,1;0,1,1"
					/>
					<TextInputWithVarButtons
						label="r（受信語, 0/1 ビット列）"
						kind={gf2Kinds.bitsR}
						value={rBits}
						onChange={setRBits}
						suggestedName="r"
						disabled={loading}
						placeholder="例: 1,0,1,1,0"
						helpText="入力形式: 10110 / 1,0,1,1,0 / 1 0 1 1 0"
					/>
				</Stack>
			)}

			{tool === "syndromeBatch" && (
				<Stack gap="md">
					<TextInputWithVarButtons
						label="H（検査行列, CSV）"
						kind={gf2Kinds.matrix}
						value={hCsv}
						onChange={setHCsv}
						suggestedName="H"
						disabled={loading}
						multiline
						rows={6}
						placeholder="例: 1,0,1;0,1,1"
					/>
					<TextInputWithVarButtons
						label="r（受信語のバッチ, 1 行 = 1 ベクトル）"
						kind={gf2Kinds.bitsRBatch}
						value={rBatch}
						onChange={setRBatch}
						suggestedName="r_batch"
						disabled={loading}
						multiline
						rows={6}
						placeholder="例:\n1,0,1,1\n0,1,0,0"
						helpText="区切り: 改行 または ';'。各行は 0/1 ビット列。"
					/>
				</Stack>
			)}

			{tool === "ghCheck" && (
				<Stack gap="md">
					<TextInputWithVarButtons
						label="G（生成行列, CSV）"
						kind={gf2Kinds.matrix}
						value={gCsv}
						onChange={setGCsv}
						suggestedName="G"
						disabled={loading}
						multiline
						rows={6}
					/>
					<TextInputWithVarButtons
						label="H（検査行列, CSV）"
						kind={gf2Kinds.matrix}
						value={hCsv}
						onChange={setHCsv}
						suggestedName="H"
						disabled={loading}
						multiline
						rows={6}
					/>
				</Stack>
			)}

			{inputError && <Text className="text-red-500">{inputError}</Text>}
			{error && <Text className="text-red-500">{error}</Text>}
		</Stack>
	);

	const actionBlock = (
		<Button onClick={onRun} disabled={!canRun} loading={loading}>
			実行
		</Button>
	);

	const gInfo = useMemo(() => formatMatrixInfo(outMatrixG, "G"), [outMatrixG]);
	const hInfo = useMemo(() => formatMatrixInfo(outMatrixH, "H"), [outMatrixH]);
	const ghInfo = useMemo(() => formatMatrixInfo(outGhProduct, "Other"), [outGhProduct]);

	const verificationBlock =
		tool === "ghCheck" ? (
			<Stack gap="md">
				<TextOutputWithButtons
					label="期待: GH^T = 0（CSV）"
					kind={gf2Kinds.matrix}
					value={outGhExpected}
					suggestedName="GHt_expected"
				/>
				<Stack gap="md">
					<TextOutputWithButtons label="結果: 判定" kind={gf2Kinds.checkGhZero} value={outGhCheck} suggestedName="gh_ok" />
					<TextOutputWithButtons
						label="結果: GH^T（CSV）"
						kind={gf2Kinds.matrix}
						value={outGhProduct}
						suggestedName="GHt"
						infoText={ghInfo}
					/>
				</Stack>
			</Stack>
		) : null;

	const outputBlock = (
		<Stack gap="md">
			{tool === "cyclicG" ? (
				<TextOutputWithButtons label="G（生成行列, CSV）" kind={gf2Kinds.matrix} value={outMatrixG} suggestedName="G" infoText={gInfo} />
			) : null}
			{tool === "cyclicH" ? (
				<TextOutputWithButtons label="H（検査行列, CSV）" kind={gf2Kinds.matrix} value={outMatrixH} suggestedName="H" infoText={hInfo} />
			) : null}
			{tool === "hFromG" ? (
				<TextOutputWithButtons label="H（検査行列, CSV）" kind={gf2Kinds.matrix} value={outMatrixH} suggestedName="H" infoText={hInfo} />
			) : null}
			{tool === "syndrome" ? (
				<TextOutputWithButtons label="s（シンドローム, bits）" kind={gf2Kinds.bitsSyndrome} value={outSyndrome} suggestedName="s" />
			) : null}
			{tool === "syndromeBatch" ? (
				<TextOutputWithButtons label="s（シンドロームのバッチ, 1行=1ベクトル）" kind={gf2Kinds.bitsSyndromeBatch} value={outSyndromeBatch} suggestedName="s_batch" />
			) : null}
		</Stack>
	);

	return <UnaryOperationLayout setting={settingBlock} input={inputBlock} action={actionBlock} output={outputBlock} verification={verificationBlock} />;
};
