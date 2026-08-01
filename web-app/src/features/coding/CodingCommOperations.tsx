"use client";

import { useMemo, useState } from "react";
import { Stack } from "../../design/primitives/Stack";
import { Flex } from "../../design/primitives/Flex";
import { Text } from "../../design/baseComponents/Text";
import { Select } from "../../design/baseComponents/Select";
import { FormField } from "../../design/baseComponents/FormField";
import { Input } from "../../design/baseComponents/Input";
import { Button } from "../../design/baseComponents/Button";
import { Spinner } from "../../design/baseComponents/Spinner";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { CodingApi, SourceCodingApi, type SourceCodingCodec } from "@my-project/client-sdk";
import { bytesToHex, hexToBytes } from "../../shared/utils/hex";
import { bitsMsbToBytes, bytesToBitsMsb, flipBitsBsc, flipBitsInBytesBsc, parseBits01, bitsToCsv } from "../../shared/utils/bits";
import { polyDivRemGF2, validateGeneratorPolynomialDividesXnPlus1GF2, isPrimitiveModulusGF2 } from "../../shared/utils/gf2Poly";
import { SaveVariableIconButton } from "../../shared/variable-manager/SaveVariableIconButton";
import { CopyIconButton } from "../../shared/ui/CopyIconButton";
import { GeneratorPolynomialBitsInput } from "./components/GeneratorPolynomialBitsInput";

type ChannelScheme = "rs" | "bch" | "cyclic";

const chooseBchAutoOrMax = async (
	t: number,
	messageLenBits: number
): Promise<{ m: number; params: { n: number; k: number; t: number } }> => {
	if (!Number.isInteger(t) || t <= 0) throw new Error("BCH の t は正の整数で指定してください");
	if (!Number.isInteger(messageLenBits) || messageLenBits < 0) throw new Error("payload の長さが不正です");
	const startM = Math.max(2, Math.ceil(Math.log2(messageLenBits + 1 || 2)));
	let last: { m: number; params: { n: number; k: number; t: number } } | null = null;
	for (let m = startM; m <= 15; m++) {
		const params = await CodingApi.bchNewAuto(m, t);
		last = { m, params };
		if (params.k >= messageLenBits) return { m, params };
	}
	return last ?? { m: 15, params: await CodingApi.bchNewAuto(15, t) };
};

const codecOptions: Array<{ value: SourceCodingCodec; label: string }> = [
	{ value: "huffman", label: "Huffman" },
	{ value: "lz78", label: "LZ78" },
	{ value: "arithmetic", label: "Arithmetic" },
];

const concatU8 = (chunks: Uint8Array[]): Uint8Array => {
	const total = chunks.reduce((sum, c) => sum + c.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const c of chunks) {
		out.set(c, offset);
		offset += c.length;
	}
	return out;
};

const chunkPadU8 = (data: Uint8Array, chunkSize: number): Uint8Array[] => {
	if (chunkSize <= 0) throw new Error("chunkSize は正の整数である必要があります");
	if (data.length === 0) return [new Uint8Array(chunkSize)];
	const chunks: Uint8Array[] = [];
	for (let i = 0; i < data.length; i += chunkSize) {
		const block = new Uint8Array(chunkSize);
		block.set(data.slice(i, i + chunkSize), 0);
		chunks.push(block);
	}
	return chunks;
};

type CommResult = {
	metrics: string;
	payloadOk: boolean;
	flippedBits: number;
	totalBits: number;
	stages: Array<{
		label: string;
		value: string;
		kind: string;
		suggestedName: string;
		rows?: number;
		mono?: boolean;
	}>;
};

export const CodingCommOperations = () => {
	const [codec, setCodec] = useState<SourceCodingCodec>("huffman");
	const [channel, setChannel] = useState<ChannelScheme>("rs");

	const [p, setP] = useState("0.01");

	const [rsK, setRsK] = useState("8");
	const [rsN, setRsN] = useState("12");
	const [rsParamMode, setRsParamMode] = useState<"manual" | "preset" | "auto">("manual");
	const [rsPreset, setRsPreset] = useState("8/12");
	const [rsAutoT, setRsAutoT] = useState("2");
	const [rsFieldMode, setRsFieldMode] = useState<"default" | "advanced">("default");
	const [rsPrimitiveBits, setRsPrimitiveBits] = useState("1,1,0,1,1,0,0,0,1");

	const [bchT, setBchT] = useState("1");
	const [bchParamMode, setBchParamMode] = useState<"auto" | "advanced">("auto");
	const [bchN, setBchN] = useState("15");
	const [bchG, setBchG] = useState("1,1,1,0,1");
	const [bchParams, setBchParams] = useState<{ n: number; k: number; t: number } | null>(null);

	const [cyclicN, setCyclicN] = useState("7");
	const [cyclicG, setCyclicG] = useState("1,1,0,1");
	const [cyclicParams, setCyclicParams] = useState<{ n: number; k: number } | null>(null);

	const [text, setText] = useState("hello hello hello");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<CommResult | null>(null);

	const rsT = useMemo(() => {
		const k = Number(rsK);
		const n = Number(rsN);
		if (!Number.isFinite(k) || !Number.isFinite(n) || n < k) return null;
		return Math.floor((n - k) / 2);
	}, [rsK, rsN]);

	const rsPrimitiveError = useMemo(() => {
		if (channel !== "rs" || rsFieldMode !== "advanced") return null;
		const px = parseBits01(rsPrimitiveBits);
		if (px.length !== 9) return "原始多項式 p(x) は次数 8（係数 9 個）で指定してください";
		if (px[0] !== 1) return "p(x) の定数項は 1 である必要があります";
		if (px[8] !== 1) return "p(x) は monic（最高次係数が 1）である必要があります";
		if (!isPrimitiveModulusGF2(px)) return "p(x) は原始多項式ではありません（GF(2^8) を生成できません）。例: AES 0x11B = 1,1,0,1,1,0,0,0,1";
		return null;
	}, [channel, rsFieldMode, rsPrimitiveBits]);

	const bchGeneratorError = useMemo(() => {
		if (channel !== "bch" || bchParamMode !== "advanced") return null;
		const n = Number(bchN);
		if (!Number.isInteger(n) || n <= 0) return "BCH の n は正の整数で指定してください";
		const g = parseBits01(bchG);
		if (g.length === 0) return "生成多項式 g(x) は 0/1 で指定してください";
		return validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
	}, [channel, bchParamMode, bchN, bchG]);

	const cyclicGeneratorError = useMemo(() => {
		if (channel !== "cyclic") return null;
		const n = Number(cyclicN);
		if (!Number.isInteger(n) || n <= 0) return "Cyclic の n は正の整数で指定してください";
		const g = parseBits01(cyclicG);
		if (g.length === 0) return "生成多項式 g(x) は 0/1 で指定してください";
		return validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
	}, [channel, cyclicN, cyclicG]);

	const textBytesLen = useMemo(() => {
		try {
			return new TextEncoder().encode(text).length;
		} catch {
			return null;
		}
	}, [text]);


	const ber = useMemo(() => {
		if (!result) return null;
		return result.totalBits === 0 ? 0 : result.flippedBits / result.totalBits;
	}, [result]);

	const canRun = useMemo(() => {
		if (loading) return false;
		if (text.trim().length === 0) return false;
		if (channel === "rs" && rsPrimitiveError) return false;
		if (channel === "bch" && bchGeneratorError) return false;
		if (channel === "cyclic" && cyclicGeneratorError) return false;
		return true;
	}, [loading, text, channel, rsPrimitiveError, bchGeneratorError, cyclicGeneratorError]);

	const run = async () => {
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const prob = Number(p);
			if (!Number.isFinite(prob) || prob < 0 || prob > 1) {
				throw new Error("誤り確率 p は 0〜1 の範囲で指定してください");
			}

			const stages: CommResult["stages"] = [];
			const pushStage = (stage: CommResult["stages"][number]) => stages.push(stage);

			// Source: text -> hex
			const sourceHex = await SourceCodingApi.encodeHex(codec, text);
			const payloadBytes = hexToBytes(sourceHex);
			const originalPayloadHex = bytesToHex(payloadBytes);
			pushStage({
				label: `1) Source 出力 hex（${payloadBytes.length} byte）`,
				value: sourceHex,
				kind: "coding.comm.source.hex",
				suggestedName: "source_hex",
				rows: 4,
				mono: true,
			});

			if (channel === "rs") {
				if (rsPrimitiveError) throw new Error(rsPrimitiveError);
				const primitivePx = rsFieldMode === "advanced" ? parseBits01(rsPrimitiveBits) : undefined;

				const k = Number(rsK);
				const n = Number(rsN);
				if (!Number.isInteger(k) || !Number.isInteger(n) || k <= 0 || n <= 0 || n < k) {
					throw new Error("RS の (k, n) は整数で n ≥ k を満たす必要があります");
				}

				const originalLen = payloadBytes.length;
				const blocks = chunkPadU8(payloadBytes, k);

				const encodedBlocks: Uint8Array[] = [];
				for (const b of blocks) {
					encodedBlocks.push(await CodingApi.reedSolomonEncode(k, n, b, primitivePx));
				}
				const encoded = concatU8(encodedBlocks);
				pushStage({
					label: `2) Channel 符号語（RS, ${encoded.length} byte, hex）`,
					value: bytesToHex(encoded),
					kind: "coding.comm.rs.codewordHex",
					suggestedName: "c_hex",
					rows: 4,
					mono: true,
				});

				const { out: received, flipped, totalBits } = flipBitsInBytesBsc(encoded, prob);
				pushStage({
					label: `3) BSC 後 受信語（RS, ${received.length} byte, hex）`,
					value: bytesToHex(received),
					kind: "coding.comm.rs.receivedHex",
					suggestedName: "r_hex",
					rows: 4,
					mono: true,
				});

				const receivedBlocks: Uint8Array[] = [];
				for (let i = 0; i < received.length; i += n) {
					receivedBlocks.push(received.slice(i, i + n));
				}

				const decodedBlocks: Uint8Array[] = [];
				for (const rb of receivedBlocks) {
					decodedBlocks.push(await CodingApi.reedSolomonDecodeBM(k, n, rb, primitivePx));
				}
				const decodedAll = concatU8(decodedBlocks);
				pushStage({
					label: `4) Channel 復号結果（RS, ${decodedAll.length} byte, hex）`,
					value: bytesToHex(decodedAll),
					kind: "coding.comm.rs.decodedAllHex",
					suggestedName: "u_hat_all_hex",
					rows: 4,
					mono: true,
				});
				const decodedPayloadBytes = decodedAll.slice(0, originalLen);

				const recoveredPayloadHex = bytesToHex(decodedPayloadBytes);
				const payloadOk = recoveredPayloadHex === originalPayloadHex;
				pushStage({
					label: `5) 復元 payload hex（${decodedPayloadBytes.length} byte）`,
					value: recoveredPayloadHex,
					kind: "coding.comm.payload.recoveredHex",
					suggestedName: "payload_hat_hex",
					rows: 4,
					mono: true,
				});

				const recoveredText = await SourceCodingApi.decodeHex(codec, recoveredPayloadHex);
				pushStage({
					label: "6) 復元テキスト",
					value: recoveredText,
					kind: "coding.comm.text.recovered",
					suggestedName: "text_hat",
					rows: 5,
					mono: false,
				});

				const metrics = `BSC(p=${prob}) flipped=${flipped}/${totalBits} (rate=${(totalBits ? flipped / totalBits : 0).toFixed(4)}), payloadOk=${payloadOk}`;

				setResult({
					metrics,
					payloadOk,
					flippedBits: flipped,
					totalBits,
					stages,
				});
				return;
			}

			if (channel === "bch") {
				let params: { n: number; k: number; t: number };
				let enc: (bits: Uint8Array) => Promise<Uint8Array>;
				let dec: (bits: Uint8Array) => Promise<Uint8Array>;

				const payloadBits = bytesToBitsMsb(payloadBytes);
				const originalBitsLen = payloadBits.length;

				if (bchParamMode === "auto") {
					const t = Number(bchT);
					if (!Number.isInteger(t) || t <= 0) throw new Error("BCH の t は正の整数で指定してください");
					const chosen = await chooseBchAutoOrMax(t, payloadBits.length);
					const m = chosen.m;
					params = chosen.params;
					setBchParams(params);
					enc = async (bits) => await CodingApi.bchEncodeAuto(m, t, bits);
					dec = async (bits) => await CodingApi.bchDecodeBM(m, t, bits);
				} else {
					if (bchGeneratorError) throw new Error(bchGeneratorError);
					const n = Number(bchN);
					if (!Number.isInteger(n) || n <= 0) throw new Error("BCH の n は正の整数で指定してください");
					const g = parseBits01(bchG);
					if (g.length === 0) throw new Error("生成多項式 g(x) は 0/1 で指定してください");
					params = await CodingApi.bchNew(n, g);
					setBchParams(params);
					enc = async (bits) => await CodingApi.bchEncode(n, g, bits);
					dec = async (bits) => await CodingApi.bchDecodeBMWithG(n, g, bits);
				}

				const bitBlocks: Uint8Array[] = [];
				for (let i = 0; i < payloadBits.length; i += params.k) {
					const block = new Uint8Array(params.k);
					block.set(payloadBits.slice(i, i + params.k), 0);
					bitBlocks.push(block);
				}
				if (bitBlocks.length === 0) bitBlocks.push(new Uint8Array(params.k));

				const encodedBitBlocks: Uint8Array[] = [];
				for (const bb of bitBlocks) encodedBitBlocks.push(await enc(bb));
				const encodedBits = concatU8(encodedBitBlocks);
				pushStage({
					label: `2) Channel 符号語（BCH, ${encodedBits.length} bit, CSV）`,
					value: bitsToCsv(encodedBits),
					kind: "coding.comm.bch.codewordBits",
					suggestedName: "c_bits",
					rows: 4,
					mono: true,
				});

				const flipped = flipBitsBsc(encodedBits, prob);
				const receivedBits = flipped.out;
				pushStage({
					label: `3) BSC 後 受信語（BCH, ${receivedBits.length} bit, CSV）`,
					value: bitsToCsv(receivedBits),
					kind: "coding.comm.bch.receivedBits",
					suggestedName: "r_bits",
					rows: 4,
					mono: true,
				});

				const receivedBitBlocks: Uint8Array[] = [];
				for (let i = 0; i < receivedBits.length; i += params.n) {
					receivedBitBlocks.push(receivedBits.slice(i, i + params.n));
				}

				const correctedBlocks: Uint8Array[] = [];
				const recoveredBlocks: Uint8Array[] = [];
				for (const rb of receivedBitBlocks) {
					const corrected = await dec(rb);
					correctedBlocks.push(corrected);
					recoveredBlocks.push(corrected.slice(params.n - params.k, params.n));
				}
				const correctedAll = concatU8(correctedBlocks);
				pushStage({
					label: `4) 訂正後コード語（BCH, ${correctedAll.length} bit, CSV）`,
					value: bitsToCsv(correctedAll),
					kind: "coding.comm.bch.correctedBits",
					suggestedName: "corr_bits",
					rows: 4,
					mono: true,
				});

				const recoveredBitsAll = concatU8(recoveredBlocks);
				const recoveredPayloadBits = recoveredBitsAll.slice(0, originalBitsLen);
				pushStage({
					label: `5) 復元メッセージ bit 列（${recoveredPayloadBits.length} bit, CSV）`,
					value: bitsToCsv(recoveredPayloadBits),
					kind: "coding.comm.bch.recoveredBits",
					suggestedName: "u_hat_bits",
					rows: 4,
					mono: true,
				});

				const decodedPayloadBytes = bitsMsbToBytes(recoveredPayloadBits);
				const recoveredPayloadHex = bytesToHex(decodedPayloadBytes);
				const payloadOk = recoveredPayloadHex === originalPayloadHex;
				pushStage({
					label: `6) 復元 payload hex（${decodedPayloadBytes.length} byte）`,
					value: recoveredPayloadHex,
					kind: "coding.comm.payload.recoveredHex",
					suggestedName: "payload_hat_hex",
					rows: 4,
					mono: true,
				});
				const recoveredText = await SourceCodingApi.decodeHex(codec, recoveredPayloadHex);
				pushStage({
					label: "7) 復元テキスト",
					value: recoveredText,
					kind: "coding.comm.text.recovered",
					suggestedName: "text_hat",
					rows: 5,
					mono: false,
				});

				const totalBits = encodedBits.length;
				const metrics = `BSC(p=${prob}) flipped=${flipped.flipped}/${totalBits} (rate=${(totalBits ? flipped.flipped / totalBits : 0).toFixed(4)}), BCH(n=${params.n},k=${params.k},t=${params.t}), payloadOk=${payloadOk}`;
				setResult({
					metrics,
					payloadOk,
					flippedBits: flipped.flipped,
					totalBits,
					stages,
				});
				return;
			}

			// cyclic
			if (cyclicGeneratorError) throw new Error(cyclicGeneratorError);
			const n = Number(cyclicN);
			if (!Number.isInteger(n) || n <= 0) throw new Error("Cyclic の n は正の整数で指定してください");
			const g = parseBits01(cyclicG);
			if (g.length === 0) throw new Error("生成多項式 g(x) は 0/1 で指定してください");
			const params = await CodingApi.cyclicNew(n, g);
			setCyclicParams(params);

			const payloadBits = bytesToBitsMsb(payloadBytes);
			const originalBitsLen = payloadBits.length;
			const bitBlocks: Uint8Array[] = [];
			for (let i = 0; i < payloadBits.length; i += params.k) {
				const block = new Uint8Array(params.k);
				block.set(payloadBits.slice(i, i + params.k), 0);
				bitBlocks.push(block);
			}
			if (bitBlocks.length === 0) bitBlocks.push(new Uint8Array(params.k));

			const encodedBlocks: Uint8Array[] = [];
			for (const bb of bitBlocks) encodedBlocks.push(await CodingApi.cyclicEncode(n, g, bb));
			const encodedBits = concatU8(encodedBlocks);
			pushStage({
				label: `2) Channel 符号語（Cyclic, ${encodedBits.length} bit, CSV）`,
				value: bitsToCsv(encodedBits),
				kind: "coding.comm.cyclic.codewordBits",
				suggestedName: "c_bits",
				rows: 4,
				mono: true,
			});

			const flipped = flipBitsBsc(encodedBits, prob);
			const receivedBits = flipped.out;
			pushStage({
				label: `3) BSC 後 受信語（Cyclic, ${receivedBits.length} bit, CSV）`,
				value: bitsToCsv(receivedBits),
				kind: "coding.comm.cyclic.receivedBits",
				suggestedName: "r_bits",
				rows: 4,
				mono: true,
			});

			const receivedBlocks: Uint8Array[] = [];
			for (let i = 0; i < receivedBits.length; i += params.n) {
				receivedBlocks.push(receivedBits.slice(i, i + params.n));
			}

			const correctedBlocks: Uint8Array[] = [];
			const recoveredBlocks: Uint8Array[] = [];
			for (const rb of receivedBlocks) {
				const corrected = await CodingApi.cyclicDecodeLUT(n, g, rb);
				correctedBlocks.push(corrected);
				const { quotient } = polyDivRemGF2(corrected, g);
				const recovered = (() => {
					if (quotient.length >= params.k) return quotient.slice(0, params.k);
					const out = new Uint8Array(params.k);
					out.set(quotient, 0);
					return out;
				})();
				recoveredBlocks.push(recovered);
			}
			const correctedAll = concatU8(correctedBlocks);
			pushStage({
				label: `4) 訂正後コード語（Cyclic, ${correctedAll.length} bit, CSV）`,
				value: bitsToCsv(correctedAll),
				kind: "coding.comm.cyclic.correctedBits",
				suggestedName: "corr_bits",
				rows: 4,
				mono: true,
			});

			const recoveredBitsAll = concatU8(recoveredBlocks);
			const recoveredPayloadBits = recoveredBitsAll.slice(0, originalBitsLen);
			pushStage({
				label: `5) 復元メッセージ bit 列（${recoveredPayloadBits.length} bit, CSV）`,
				value: bitsToCsv(recoveredPayloadBits),
				kind: "coding.comm.cyclic.recoveredBits",
				suggestedName: "u_hat_bits",
				rows: 4,
				mono: true,
			});

			const decodedPayloadBytes = bitsMsbToBytes(recoveredPayloadBits);
			const recoveredPayloadHex = bytesToHex(decodedPayloadBytes);
			const payloadOk = recoveredPayloadHex === originalPayloadHex;
			pushStage({
				label: `6) 復元 payload hex（${decodedPayloadBytes.length} byte）`,
				value: recoveredPayloadHex,
				kind: "coding.comm.payload.recoveredHex",
				suggestedName: "payload_hat_hex",
				rows: 4,
				mono: true,
			});
			const recoveredText = await SourceCodingApi.decodeHex(codec, recoveredPayloadHex);
			pushStage({
				label: "7) 復元テキスト",
				value: recoveredText,
				kind: "coding.comm.text.recovered",
				suggestedName: "text_hat",
				rows: 5,
				mono: false,
			});

			const totalBits = encodedBits.length;
			const metrics = `BSC(p=${prob}) flipped=${flipped.flipped}/${totalBits} (rate=${(totalBits ? flipped.flipped / totalBits : 0).toFixed(4)}), Cyclic(n=${params.n},k=${params.k}), payloadOk=${payloadOk}`;
			setResult({
				metrics,
				payloadOk,
				flippedBits: flipped.flipped,
				totalBits,
				stages,
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Stack gap={"lg"}>
			<Stack gap={"sm"}>
				<Text weight="bold" variant="body">Comm (E2E) の設定</Text>
				<Stack direction="row" gap={"sm"} className="items-end flex-wrap">
					<FormField label="Source 方式">
						<Select
							value={codec}
							onChange={(e) => setCodec(e.target.value as SourceCodingCodec)}
							className="w-44"
							options={codecOptions}
						/>
					</FormField>

					<FormField label="Channel 方式">
						<Select
							value={channel}
							onChange={(e) => setChannel(e.target.value as ChannelScheme)}
							className="w-56"
							options={[
								{ value: "rs", label: "Reed–Solomon (GF256)" },
								{ value: "bch", label: "BCH (GF2)" },
								{ value: "cyclic", label: "Cyclic code (GF2)" },
							]}
						/>
					</FormField>

					<FormField label="BSC 誤り確率 p">
						<Input value={p} onChange={(e) => setP(e.target.value)} className="w-32" />
					</FormField>

					{channel === "rs" ? (
						<>
							<FormField label="パラメータ">
								<Select
									value={rsParamMode}
									onChange={(e) => {
										const next = e.target.value as "manual" | "preset" | "auto";
										setRsParamMode(next);
										if (next === "preset") {
											const [k, n] = rsPreset.split("/").map((x) => Number(x));
											if (Number.isInteger(k) && Number.isInteger(n)) {
												setRsK(String(k));
												setRsN(String(n));
											}
										}
										if (next === "auto") {
											const k = Number(rsK);
											const t = Number(rsAutoT);
											if (Number.isInteger(k) && Number.isInteger(t)) setRsN(String(k + 2 * t));
										}
									}}
									className="w-40"
									options={[
										{ value: "manual", label: "手動 (k,n)" },
										{ value: "preset", label: "プリセット" },
										{ value: "auto", label: "自動 (k,t → n)" },
									]}
								/>
							</FormField>

							{rsParamMode === "preset" ? (
								<FormField label="(k,n)">
									<Select
										value={rsPreset}
										onChange={(e) => {
											const v = e.target.value;
											setRsPreset(v);
											const [k, n] = v.split("/").map((x) => Number(x));
											if (Number.isInteger(k) && Number.isInteger(n)) {
												setRsK(String(k));
												setRsN(String(n));
											}
									}}
									className="w-44"
									options={[
										{ value: "8/12", label: "(8, 12)" },
										{ value: "16/24", label: "(16, 24)" },
										{ value: "32/48", label: "(32, 48)" },
										{ value: "64/96", label: "(64, 96)" },
									]}
								/>
							</FormField>
						) : null}

						{rsParamMode === "auto" ? (
							<>
								<FormField label="k (bytes)">
									<Input
										value={rsK}
										onChange={(e) => {
											const nextK = e.target.value;
											setRsK(nextK);
											const k = Number(nextK);
											const t = Number(rsAutoT);
											if (Number.isInteger(k) && Number.isInteger(t)) setRsN(String(k + 2 * t));
										}}
										className="w-28"
									/>
								</FormField>
								<FormField label="t">
									<Input
										value={rsAutoT}
										onChange={(e) => {
											const nextT = e.target.value;
											setRsAutoT(nextT);
											const k = Number(rsK);
											const t = Number(nextT);
											if (Number.isInteger(k) && Number.isInteger(t)) setRsN(String(k + 2 * t));
										}}
										className="w-28"
									/>
								</FormField>
								<FormField label="n (auto)">
									<Input value={rsN} readOnly className="w-28 font-mono" />
								</FormField>
							</>
						) : (
							<>
								<FormField label="k (bytes)">
									<Input value={rsK} onChange={(e) => setRsK(e.target.value)} className="w-28" />
								</FormField>
								<FormField label="n (bytes)">
									<Input value={rsN} onChange={(e) => setRsN(e.target.value)} className="w-28" />
								</FormField>
							</>
						)}

												<FormField label="フィールド">
													<Select
														value={rsFieldMode}
														onChange={(e) => setRsFieldMode(e.target.value as "default" | "advanced")}
														className="w-56"
														options={[
															{ value: "default", label: "Default (AES 0x11B)" },
															{ value: "advanced", label: "Advanced (p(x))" },
														]}
													/>
												</FormField>
						</>
					) : channel === "bch" ? (
						<>
							<FormField label="パラメータ">
								<Select
									value={bchParamMode}
									onChange={(e) => setBchParamMode(e.target.value as "auto" | "advanced")}
									className="w-40"
									options={[
										{ value: "auto", label: "Auto (t; m は自動)" },
										{ value: "advanced", label: "Advanced (n,g)" },
									]}
								/>
							</FormField>
							{bchParamMode === "auto" ? (
								<>
									<FormField label="t">
										<Input value={bchT} onChange={(e) => setBchT(e.target.value)} className="w-28" />
									</FormField>
								</>
							) : (
								<FormField label="n">
									<Input value={bchN} onChange={(e) => setBchN(e.target.value)} className="w-28" />
								</FormField>
							)}
						</>
					) : (
						<>
							<FormField label="n">
								<Input value={cyclicN} onChange={(e) => setCyclicN(e.target.value)} className="w-28" />
							</FormField>
						</>
					)}
				</Stack>

							{channel === "rs" && rsFieldMode === "advanced" ? (
								<Stack gap={"xs"}>
									<GeneratorPolynomialBitsInput
										label="原始多項式 p(x)（GF(2), 次数8）"
										value={rsPrimitiveBits}
										onChange={setRsPrimitiveBits}
										disabled={loading}
										required
										kind="coding.comm.rs.primitiveBits"
										suggestedName="p_bits"
										rows={2}
										placeholder="e.g. 1,1,0,1,1,0,0,0,1"
										helpText="定数項→高次（x^0..x^8）の順に 0/1。長さ 9 で入力します。"
									/>
									{rsPrimitiveError ? <Text variant="xs" className="text-brand-danger">{rsPrimitiveError}</Text> : null}
							</Stack>
						) : null}

				{channel === "bch" && bchParamMode === "advanced" ? (
							<Stack gap={"xs"}>
								<GeneratorPolynomialBitsInput
									label="生成多項式 g(x)（係数, 0/1）"
									value={bchG}
									onChange={setBchG}
									disabled={loading}
									required
									kind="coding.comm.bch.generatorBits"
									helpText="定数項→高次の順に 0/1 で入力します。例: 1,1,1,0,1 は g(x)=1+x+x^2+x^4"
								/>
								{bchGeneratorError ? <Text variant="xs" className="text-brand-danger">{bchGeneratorError}</Text> : null}
							</Stack>
				) : null}

				{channel === "cyclic" ? (
							<Stack gap={"xs"}>
								<GeneratorPolynomialBitsInput
									label="生成多項式 g(x)（係数, 0/1）"
									value={cyclicG}
									onChange={setCyclicG}
									disabled={loading}
									required
									kind="coding.comm.cyclic.generatorBits"
									helpText="定数項→高次の順に 0/1 で入力します。例: 1,1,0,1 は g(x)=1+x+x^3"
								/>
								{cyclicGeneratorError ? <Text variant="xs" className="text-brand-danger">{cyclicGeneratorError}</Text> : null}
							</Stack>
				) : null}

				{channel === "rs" && (
					<Text color={"muted"}>RS は byte ブロック（k→n）で送受信します。t = ⌊(n-k)/2⌋ = {rsT ?? "-"}</Text>
				)}
				{channel === "bch" && (
					<Text color={"muted"}>
						BCH は bit ブロック（k→n）で送受信します。
						{bchParams ? ` n=${bchParams.n}, k=${bchParams.k}, t=${bchParams.t}` : ""}
					</Text>
				)}
				{channel === "cyclic" && (
					<Text color={"muted"}>
						Cyclic は bit ブロック（k→n）で送受信します。
						{cyclicParams ? ` n=${cyclicParams.n}, k=${cyclicParams.k}` : ""}
					</Text>
				)}
			</Stack>

			<Stack className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-6">
				<UnaryOperationLayout
					input={
						<Stack gap={"xs"}>
							<FormField label="送信テキスト" required>
								<Input
									multeline
									rows={5}
									value={text}
									onChange={(e) => setText(e.target.value)}
									disabled={loading}
								/>
							</FormField>
							<Text variant="xs" color="muted">
								現在: {textBytesLen ?? "-"} byte（UTF-8）
							</Text>
						</Stack>
					}
					action={
						<Stack gap={"sm"} align="start">
							<Button type="button" size="md" className="w-auto" onClick={run} disabled={!canRun}>
								{loading ? <Spinner size="sm" /> : "送信 → 復元"}
							</Button>
							{error && <Text className="text-brand-danger">{error}</Text>}
						</Stack>
					}
					output={
						<Stack gap={"md"}>
							<Stack gap={"xs"}>
								<Text variant="detail">Metrics</Text>
								<Text color={result?.payloadOk ? "muted" : "danger"}>
									{result
										? `${result.metrics}${ber != null ? ` / BER=${ber.toFixed(6)}` : ""}`
										: "-"}
								</Text>
							</Stack>

							{(result?.stages ?? []).map((s) => (
								<Stack key={`${s.kind}:${s.label}`} gap={"sm"}>
									<Flex align="center" justify="between">
										<Text variant="detail">{s.label}</Text>
										<Flex align="center" gap="xs">
											<SaveVariableIconButton
												kind={s.kind}
												value={s.value}
												suggestedName={s.suggestedName}
												disabled={loading || s.value.trim().length === 0}
											/>
											<CopyIconButton text={s.value} disabled={loading || s.value.trim().length === 0} />
										</Flex>
									</Flex>
									<Input
										multeline
										rows={s.rows ?? 4}
										readOnly
										className={s.mono ? "font-mono" : undefined}
										value={s.value}
										placeholder="-"
									/>
								</Stack>
							))}
						</Stack>
					}
				/>
			</Stack>
		</Stack>
	);
};
