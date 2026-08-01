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
import { CodingApi } from "@my-project/client-sdk";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { bytesToHex, hexToBytes } from "../../shared/utils/hex";
import { bitsToCsv, flipBitsBsc, flipBitsInBytesBsc, parseBits01, bytesToBitsMsb } from "../../shared/utils/bits";
import { polyDivRemGF2, validateGeneratorPolynomialDividesXnPlus1GF2, isPrimitiveModulusGF2 } from "../../shared/utils/gf2Poly";
import { VariablePickerIconButton } from "../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../shared/variable-manager/SaveVariableIconButton";
import { CopyIconButton } from "../../shared/ui/CopyIconButton";
import { GeneratorPolynomialBitsInput } from "./components/GeneratorPolynomialBitsInput";

type Scheme = "hamming74" | "rs" | "bch" | "cyclic";
type Mode = "encode" | "decode";

const inferBchMFromCodewordLen = (n: number): number => {
	if (!Number.isInteger(n) || n <= 0) throw new Error("receivedBits の長さ n は正の整数である必要があります");
	const x = n + 1;
	// m<=15 なので 32bit 範囲で安全
	if ((x & (x - 1)) !== 0) throw new Error("receivedBits の長さは n=2^m-1 の形である必要があります");
	const m = Math.round(Math.log2(x));
	if (2 ** m !== x) throw new Error("receivedBits の長さから m を推定できません（n+1 が 2 の冪ではありません）");
	if (m < 2 || m > 15) throw new Error("BCH(Auto) は 2 ≤ m ≤ 15 の範囲でのみ対応しています");
	return m;
};

const chooseBchAuto = async (t: number, messageLenBits: number): Promise<{ m: number; params: { n: number; k: number; t: number } }> => {
	if (!Number.isInteger(t) || t <= 0) throw new Error("BCH の t は正の整数で指定してください");
	if (!Number.isInteger(messageLenBits) || messageLenBits < 0) throw new Error("messageBits の長さが不正です");
	const startM = Math.max(2, Math.ceil(Math.log2(messageLenBits + 1 || 2)));
	for (let m = startM; m <= 15; m++) {
		const params = await CodingApi.bchNewAuto(m, t);
		if (params.k >= messageLenBits) return { m, params };
	}
	throw new Error("messageBits が長すぎます（この実装の BCH(Auto) は m≤15 まで）");
};

export const CodingOperations = () => {
	const [scheme, setScheme] = useState<Scheme>("rs");
	const [mode, setMode] = useState<Mode>("encode");

	const [hammingBits, setHammingBits] = useState("1,0,1,1");

	const [rsK, setRsK] = useState("8");
	const [rsN, setRsN] = useState("12");
	const [rsParamMode, setRsParamMode] = useState<"manual" | "preset" | "auto">("manual");
	const [rsPreset, setRsPreset] = useState("8/12");
	const [rsAutoT, setRsAutoT] = useState("2");
	const [rsFieldMode, setRsFieldMode] = useState<"default" | "advanced">("default");
	// AES modulus: x^8 + x^4 + x^3 + x + 1 (0x11B)
	const [rsPrimitiveBits, setRsPrimitiveBits] = useState("1,1,0,1,1,0,0,0,1");
	const [rsMessageHex, setRsMessageHex] = useState("0001020304050607");
	const [rsReceivedHex, setRsReceivedHex] = useState("");

	const [bchT, setBchT] = useState("1");
	const [bchParamMode, setBchParamMode] = useState<"auto" | "advanced">("auto");
	const [bchN, setBchN] = useState("15");
	const [bchG, setBchG] = useState("1,1,1,0,1");
	const [bchMessageBits, setBchMessageBits] = useState("1,0,1,1");
	const [bchReceivedBits, setBchReceivedBits] = useState("");
	const [bchParams, setBchParams] = useState<{ n: number; k: number; t: number } | null>(null);

	const [cyclicN, setCyclicN] = useState("7");
	const [cyclicG, setCyclicG] = useState("1,1,0,1");
	const [cyclicMessageBits, setCyclicMessageBits] = useState("1,0,1,1");
	const [cyclicReceivedBits, setCyclicReceivedBits] = useState("");
	const [cyclicParams, setCyclicParams] = useState<{ n: number; k: number } | null>(null);

	const [bscP, setBscP] = useState("0.01");

	const [loading, setLoading] = useState(false);
	const [encodedOut, setEncodedOut] = useState<string>("");
	const [decodedOut, setDecodedOut] = useState<string>("");
	const [decodedOut2, setDecodedOut2] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const [verifyNoisy, setVerifyNoisy] = useState<string>("");
	const [verifyRecovered, setVerifyRecovered] = useState<string>("");
	const [verifyMetrics, setVerifyMetrics] = useState<string>("");

	const rsT = useMemo(() => {
		const k = Number(rsK);
		const n = Number(rsN);
		if (!Number.isFinite(k) || !Number.isFinite(n) || n < k) return null;
		return Math.floor((n - k) / 2);
	}, [rsK, rsN]);

	const rsMessageBytesLen = useMemo(() => {
		try {
			return hexToBytes(rsMessageHex).length;
		} catch {
			return null;
		}
	}, [rsMessageHex]);
	const rsReceivedBytesLen = useMemo(() => {
		try {
			return hexToBytes(rsReceivedHex).length;
		} catch {
			return null;
		}
	}, [rsReceivedHex]);
	const bchMessageBitsLen = useMemo(() => {
		try {
			return parseBits01(bchMessageBits).length;
		} catch {
			return null;
		}
	}, [bchMessageBits]);
	type BitsLen = number | null;
	const bchReceivedBitsLen: BitsLen = useMemo(() => {
		try {
			return parseBits01(bchReceivedBits).length;
		} catch {
			return null;
		}
	}, [bchReceivedBits]);
	const cyclicMessageBitsLen: BitsLen = useMemo(() => {
		try {
			return parseBits01(cyclicMessageBits).length;
		} catch {
			return null;
		}
	}, [cyclicMessageBits]);
	const cyclicReceivedBitsLen: BitsLen = useMemo(() => {
		try {
			return parseBits01(cyclicReceivedBits).length;
		} catch {
			return null;
		}
	}, [cyclicReceivedBits]);

	const rsPrimitiveError = useMemo(() => {
		if (rsFieldMode !== "advanced") return null;
		try {
			const px = parseBits01(rsPrimitiveBits);
			if (px.length !== 9) return "p(x) は次数 8（係数 9 個）で入力してください";
			if ((px[0] & 1) === 0 || (px[8] & 1) === 0) return "p(x) の定数項と最高次係数は 1 である必要があります";
			if (!isPrimitiveModulusGF2(px)) return "p(x) は原始多項式ではありません（GF(2^8) を生成できません）。例: AES 0x11B = 1,1,0,1,1,0,0,0,1";
			return null;
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	}, [rsFieldMode, rsPrimitiveBits]);

	const bchGeneratorError = useMemo(() => {
		if (scheme !== "bch") return null;
		if (bchParamMode !== "advanced") return null;
		try {
			const n = Number(bchN);
			if (!Number.isInteger(n) || n <= 0) return "BCH の n は正の整数で指定してください";
			const g = parseBits01(bchG);
			return validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	}, [scheme, bchParamMode, bchN, bchG]);

	const cyclicGeneratorError = useMemo(() => {
		if (scheme !== "cyclic") return null;
		try {
			const n = Number(cyclicN);
			if (!Number.isInteger(n) || n <= 0) return "Cyclic の n は正の整数で指定してください";
			const g = parseBits01(cyclicG);
			return validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	}, [scheme, cyclicN, cyclicG]);

	const modeOptions = useMemo(() => {
		if (scheme === "hamming74") {
			return [{ value: "encode", label: "Encode" }];
		}
		return [
			{ value: "encode", label: "Encode" },
			{ value: "decode", label: "Decode" },
		];
	}, [scheme]);

	const canRun = useMemo(() => {
		if (loading) return false;
		if (scheme === "hamming74") return hammingBits.trim().length > 0;
		if (scheme === "rs") return !rsPrimitiveError && (mode === "encode" ? rsMessageHex : rsReceivedHex).trim().length > 0;
		if (scheme === "bch") return !bchGeneratorError && (mode === "encode" ? bchMessageBits : bchReceivedBits).trim().length > 0;
		return !cyclicGeneratorError && (mode === "encode" ? cyclicMessageBits : cyclicReceivedBits).trim().length > 0;
	}, [
		loading,
		scheme,
		mode,
		hammingBits,
		rsMessageHex,
		rsReceivedHex,
		rsPrimitiveError,
		bchMessageBits,
		bchReceivedBits,
		bchGeneratorError,
		cyclicMessageBits,
		cyclicReceivedBits,
		cyclicGeneratorError,
	]);

	const canVerify = useMemo(() => {
		if (loading) return false;
		if (mode !== "encode") return false;
		if (scheme === "hamming74") return false;
		if (scheme === "rs") return !rsPrimitiveError && rsMessageHex.trim().length > 0;
		if (scheme === "bch") return !bchGeneratorError && bchMessageBits.trim().length > 0;
		return !cyclicGeneratorError && cyclicMessageBits.trim().length > 0;
	}, [loading, mode, scheme, rsMessageHex, bchMessageBits, cyclicMessageBits, rsPrimitiveError, bchGeneratorError, cyclicGeneratorError]);

	const run = async () => {
		setLoading(true);
		setError(null);
		setEncodedOut("");
		setDecodedOut("");
		setDecodedOut2("");
		setVerifyNoisy("");
		setVerifyRecovered("");
		setVerifyMetrics("");
		try {
			if (scheme === "hamming74") {
				const out = await CodingApi.hamming74Encode(hammingBits);
				setEncodedOut(out);
				return;
			}

			if (scheme === "rs") {
				const k = Number(rsK);
				const n = Number(rsN);
				if (!Number.isInteger(k) || !Number.isInteger(n) || k <= 0 || n <= 0 || n < k) {
					throw new Error("RS の (k, n) は整数で n ≥ k を満たす必要があります");
				}
				const primitivePx = rsFieldMode === "advanced" ? (() => {
					const px = parseBits01(rsPrimitiveBits);
					if (px.length !== 9) throw new Error("p(x) は次数 8（係数 9 個）で入力してください");
					if ((px[0] & 1) === 0 || (px[8] & 1) === 0) throw new Error("p(x) の定数項と最高次係数は 1 である必要があります");
					if (!isPrimitiveModulusGF2(px)) throw new Error("p(x) は原始多項式ではありません（GF(2^8) を生成できません）");
					return px;
				})() : undefined;

				if (mode === "encode") {
					const msg = hexToBytes(rsMessageHex);
					if (msg.length !== k) {
						throw new Error(`message は ${k} byte 必要です（現在 ${msg.length} byte）`);
					}
					const out = await CodingApi.reedSolomonEncode(k, n, msg, primitivePx);
					setEncodedOut(bytesToHex(out));
				} else {
					const recv = hexToBytes(rsReceivedHex);
					if (recv.length !== n) {
						throw new Error(`received は ${n} byte 必要です（現在 ${recv.length} byte）`);
					}
					const out = await CodingApi.reedSolomonDecodeBM(k, n, recv, primitivePx);
					setDecodedOut(bytesToHex(out));
				}
				return;
			}

			if (scheme === "cyclic") {
				const n = Number(cyclicN);
				if (!Number.isInteger(n) || n <= 0) throw new Error("Cyclic の n は正の整数で指定してください");
				const g = parseBits01(cyclicG);
				if (g.length === 0) throw new Error("生成多項式 g(x) は 0/1 で指定してください");
				const genErr = validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
				if (genErr) throw new Error(genErr);
				const params = await CodingApi.cyclicNew(n, g);
				setCyclicParams(params);

				if (mode === "encode") {
					const msgBits = parseBits01(cyclicMessageBits);
					if (msgBits.length !== params.k) {
						throw new Error(`messageBits は ${params.k} bit 必要です（現在 ${msgBits.length} bit）`);
					}
					const out = await CodingApi.cyclicEncode(n, g, msgBits);
					setEncodedOut(bitsToCsv(out));
				} else {
					const recvBits = parseBits01(cyclicReceivedBits);
					if (recvBits.length !== params.n) {
						throw new Error(`receivedBits は ${params.n} bit 必要です（現在 ${recvBits.length} bit）`);
					}
					const corrected = await CodingApi.cyclicDecodeLUT(n, g, recvBits);
					const { quotient } = polyDivRemGF2(corrected, g);
					const recoveredBits = (() => {
						if (quotient.length >= params.k) return quotient.slice(0, params.k);
						const out = new Uint8Array(params.k);
						out.set(quotient, 0);
						return out;
					})();
					setDecodedOut(bitsToCsv(corrected));
					setDecodedOut2(bitsToCsv(recoveredBits));
				}
				return;
			}

			// BCH
			let params: { n: number; k: number; t: number };
			if (bchParamMode === "auto") {
				const t = Number(bchT);
				if (!Number.isInteger(t) || t <= 0) throw new Error("BCH の t は正の整数で指定してください");
				if (mode === "encode") {
					const msgBits = parseBits01(bchMessageBits);
					const chosen = await chooseBchAuto(t, msgBits.length);
					const m = chosen.m;
					params = chosen.params;
					setBchParams(params);
					if (msgBits.length > params.k) {
						throw new Error(`messageBits が長すぎます（最大 ${params.k} bit, 現在 ${msgBits.length} bit）`);
					}
					const padded = msgBits.length === params.k ? msgBits : (() => {
						const out = new Uint8Array(params.k);
						out.set(msgBits, 0);
						return out;
					})();
					const out = await CodingApi.bchEncodeAuto(m, t, padded);
					setEncodedOut(bitsToCsv(out));
				} else {
					const recvBits = parseBits01(bchReceivedBits);
					const m = inferBchMFromCodewordLen(recvBits.length);
					params = await CodingApi.bchNewAuto(m, t);
					setBchParams(params);
					if (recvBits.length !== params.n) {
						throw new Error(`receivedBits は ${params.n} bit 必要です（現在 ${recvBits.length} bit）`);
					}
					const corrected = await CodingApi.bchDecodeBM(m, t, recvBits);
					const recovered = corrected.slice(params.n - params.k, params.n);
					setDecodedOut(bitsToCsv(corrected));
					setDecodedOut2(bitsToCsv(recovered));
				}
			} else {
				const n = Number(bchN);
				if (!Number.isInteger(n) || n <= 0) throw new Error("BCH の n は正の整数で指定してください");
				const g = parseBits01(bchG);
				if (g.length === 0) throw new Error("生成多項式 g(x) は 0/1 で指定してください");
				const genErr = validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
				if (genErr) throw new Error(genErr);
				params = await CodingApi.bchNew(n, g);
				setBchParams(params);
				if (mode === "encode") {
					const msgBits = parseBits01(bchMessageBits);
					if (msgBits.length !== params.k) {
						throw new Error(`messageBits は ${params.k} bit 必要です（現在 ${msgBits.length} bit）`);
					}
					const out = await CodingApi.bchEncode(n, g, msgBits);
					setEncodedOut(bitsToCsv(out));
				} else {
					const recvBits = parseBits01(bchReceivedBits);
					if (recvBits.length !== params.n) {
						throw new Error(`receivedBits は ${params.n} bit 必要です（現在 ${recvBits.length} bit）`);
					}
					const corrected = await CodingApi.bchDecodeBMWithG(n, g, recvBits);
					const recovered = corrected.slice(params.n - params.k, params.n);
					setDecodedOut(bitsToCsv(corrected));
					setDecodedOut2(bitsToCsv(recovered));
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	const verify = async () => {
		setLoading(true);
		setError(null);
		setVerifyNoisy("");
		setVerifyRecovered("");
		setVerifyMetrics("");
		try {
			const p = Number(bscP);
			if (!Number.isFinite(p) || p < 0 || p > 1) throw new Error("誤り確率 p は 0〜1 の範囲で指定してください");

			if (scheme === "rs") {
				const k = Number(rsK);
				const n = Number(rsN);
				if (!Number.isInteger(k) || !Number.isInteger(n) || k <= 0 || n <= 0 || n < k) {
					throw new Error("RS の (k, n) は整数で n ≥ k を満たす必要があります");
				}
				const primitivePx = rsFieldMode === "advanced" ? (() => {
					const px = parseBits01(rsPrimitiveBits);
					if (px.length !== 9) throw new Error("p(x) は次数 8（係数 9 個）で入力してください");
					if ((px[0] & 1) === 0 || (px[8] & 1) === 0) throw new Error("p(x) の定数項と最高次係数は 1 である必要があります");
					return px;
				})() : undefined;
				const msg = hexToBytes(rsMessageHex);
				if (msg.length !== k) {
					throw new Error(`message は ${k} byte 必要です（現在 ${msg.length} byte）`);
				}
				const code = await CodingApi.reedSolomonEncode(k, n, msg, primitivePx);
				const flipped = flipBitsInBytesBsc(code, p);
				const noisy = flipped.out;
				const dec = await CodingApi.reedSolomonDecodeBM(k, n, noisy, primitivePx);

				const a = bytesToBitsMsb(msg);
				const b = bytesToBitsMsb(dec);
				let errBits = 0;
				for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) errBits++;
				const ber = a.length === 0 ? 0 : errBits / a.length;
				const ok = errBits === 0;

				setVerifyNoisy(bytesToHex(noisy));
				setVerifyRecovered(bytesToHex(dec));
				setVerifyMetrics(
					`BSC(p=${p}) flipped=${flipped.flipped}/${flipped.totalBits} (rate=${(flipped.totalBits ? flipped.flipped / flipped.totalBits : 0).toFixed(4)}), message BER=${ber.toFixed(6)}, ok=${ok}`
				);
				return;
			}

			if (scheme === "cyclic") {
				const n = Number(cyclicN);
				if (!Number.isInteger(n) || n <= 0) throw new Error("Cyclic の n は正の整数で指定してください");
				const g = parseBits01(cyclicG);
				if (g.length === 0) throw new Error("生成多項式 g(x) は 0/1 で指定してください");
				const genErr = validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
				if (genErr) throw new Error(genErr);
				const params = await CodingApi.cyclicNew(n, g);
				setCyclicParams(params);
				const msgBits = parseBits01(cyclicMessageBits);
				if (msgBits.length !== params.k) {
					throw new Error(`messageBits は ${params.k} bit 必要です（現在 ${msgBits.length} bit）`);
				}
				const code = await CodingApi.cyclicEncode(n, g, msgBits);
				const flipped = flipBitsBsc(code, p);
				const noisy = flipped.out;
				const corrected = await CodingApi.cyclicDecodeLUT(n, g, noisy);
				const { quotient } = polyDivRemGF2(corrected, g);
				const recovered = (() => {
					if (quotient.length >= params.k) return quotient.slice(0, params.k);
					const out = new Uint8Array(params.k);
					out.set(quotient, 0);
					return out;
				})();

				let errBits = 0;
				for (let i = 0; i < params.k; i++) if ((msgBits[i] & 1) !== (recovered[i] & 1)) errBits++;
				const ber = params.k === 0 ? 0 : errBits / params.k;
				const ok = errBits === 0;
				setVerifyNoisy(bitsToCsv(noisy));
				setVerifyRecovered(bitsToCsv(recovered));
				setVerifyMetrics(
					`BSC(p=${p}) flipped=${flipped.flipped}/${code.length} (rate=${(code.length ? flipped.flipped / code.length : 0).toFixed(4)}), message BER=${ber.toFixed(6)}, ok=${ok}`
				);
				return;
			}

			// BCH
			let params: { n: number; k: number; t: number };
			let code: Uint8Array;
			let noisy: Uint8Array;
			let corrected: Uint8Array;
			let msgBits: Uint8Array;
			let flipped: { out: Uint8Array; flipped: number };

			if (bchParamMode === "auto") {
				const t = Number(bchT);
				if (!Number.isInteger(t) || t <= 0) throw new Error("BCH の t は正の整数で指定してください");
				const rawMsgBits = parseBits01(bchMessageBits);
				const chosen = await chooseBchAuto(t, rawMsgBits.length);
				const m = chosen.m;
				params = chosen.params;
				setBchParams(params);
				if (rawMsgBits.length > params.k) {
					throw new Error(`messageBits が長すぎます（最大 ${params.k} bit, 現在 ${rawMsgBits.length} bit）`);
				}
				msgBits = rawMsgBits.length === params.k ? rawMsgBits : (() => {
					const out = new Uint8Array(params.k);
					out.set(rawMsgBits, 0);
					return out;
				})();
				code = await CodingApi.bchEncodeAuto(m, t, msgBits);
				flipped = flipBitsBsc(code, p);
				noisy = flipped.out;
				corrected = await CodingApi.bchDecodeBM(m, t, noisy);
			} else {
				const n = Number(bchN);
				if (!Number.isInteger(n) || n <= 0) throw new Error("BCH の n は正の整数で指定してください");
				const g = parseBits01(bchG);
				if (g.length === 0) throw new Error("生成多項式 g(x) は 0/1 で指定してください");
				const genErr = validateGeneratorPolynomialDividesXnPlus1GF2(n, g);
				if (genErr) throw new Error(genErr);
				params = await CodingApi.bchNew(n, g);
				setBchParams(params);
				msgBits = parseBits01(bchMessageBits);
				if (msgBits.length !== params.k) {
					throw new Error(`messageBits は ${params.k} bit 必要です（現在 ${msgBits.length} bit）`);
				}
				code = await CodingApi.bchEncode(n, g, msgBits);
				flipped = flipBitsBsc(code, p);
				noisy = flipped.out;
				corrected = await CodingApi.bchDecodeBMWithG(n, g, noisy);
			}

			const recovered = corrected.slice(params.n - params.k, params.n);
			let errBits = 0;
			for (let i = 0; i < params.k; i++) if ((msgBits[i] & 1) !== (recovered[i] & 1)) errBits++;
			const ber = params.k === 0 ? 0 : errBits / params.k;
			const ok = errBits === 0;
			setVerifyNoisy(bitsToCsv(noisy));
			setVerifyRecovered(bitsToCsv(recovered));
			setVerifyMetrics(
				`BSC(p=${p}) flipped=${flipped.flipped}/${code.length} (rate=${(code.length ? flipped.flipped / code.length : 0).toFixed(4)}), message BER=${ber.toFixed(6)}, ok=${ok}`
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Stack gap={"lg"}>
			<Stack gap={"sm"}>
				<Text weight="bold" variant="body">誤り訂正符号（Channel）の設定</Text>
				<Stack direction="row" gap={"sm"} className="items-end">
					<FormField label="方式">
						<Select
							value={scheme}
							onChange={(e) => {
								const next = e.target.value as Scheme;
								setScheme(next);
								if (next === "hamming74") setMode("encode");
							}}
							className="w-56"
							options={[
								{ value: "rs", label: "Reed–Solomon (GF256)" },
								{ value: "bch", label: "BCH (GF2)" },
								{ value: "cyclic", label: "Cyclic code (GF2)" },
								{ value: "hamming74", label: "Hamming(7,4)" },
							]}
						/>
					</FormField>

					<FormField label="モード">
						<Select
							value={mode}
							onChange={(e) => setMode(e.target.value as Mode)}
							className="w-40"
							options={modeOptions}
							disabled={scheme === "hamming74"}
						/>
					</FormField>
				</Stack>

				{scheme === "rs" && (
					<Text color={"muted"}>RS は byte（hex）入力です。t = ⌊(n-k)/2⌋ = {rsT ?? "-"}</Text>
				)}
				{scheme === "bch" && (
					<Text color={"muted"}>
						BCH は bit（0/1）入力です。
						{bchParams ? ` n=${bchParams.n}, k=${bchParams.k}, t=${bchParams.t}` : ""}
					</Text>
				)}
				{scheme === "cyclic" && (
					<Text color={"muted"}>
						Cyclic は bit（0/1）入力です。
						{cyclicParams ? ` n=${cyclicParams.n}, k=${cyclicParams.k}` : ""}
					</Text>
				)}
				{scheme === "hamming74" && (
					<Text color={"muted"}>Hamming(7,4) の符号化のみ</Text>
				)}
			</Stack>

			<Stack className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-6">
				<UnaryOperationLayout
					input={
						<Stack gap={"sm"}>
							{scheme === "hamming74" && (
								<Stack gap={"sm"}>
									<Flex align="center" justify="between">
										<Text variant="detail" className="flex items-center gap-1">
																		4ビット入力 <Text span color="danger">*</Text>
										</Text>
										<Flex align="center" gap="xs">
											<VariablePickerIconButton
												kind="coding.channel.hamming74.messageBits"
												disabled={loading}
												onPick={(e) => setHammingBits(e.value)}
											/>
											<SaveVariableIconButton
												kind="coding.channel.hamming74.messageBits"
												value={hammingBits}
												suggestedName="u"
												disabled={loading || hammingBits.trim().length === 0}
											/>
											<CopyIconButton text={hammingBits} disabled={loading || hammingBits.trim().length === 0} />
										</Flex>
									</Flex>
									<Text variant="xs" color="muted">
										例: 1011 または 1,0,1,1
									</Text>
									<Input value={hammingBits} onChange={(e) => setHammingBits(e.target.value)} disabled={loading} className="font-mono" />
								</Stack>
							)}

							{scheme === "rs" && (
								<>
									<Stack direction="row" gap={"sm"} className="items-end">
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
									</Stack>

										<Stack direction="row" gap={"sm"} className="items-end">
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
										</Stack>

										{rsFieldMode === "advanced" ? (
											<Stack gap={"xs"}>
												<GeneratorPolynomialBitsInput
													label="原始多項式 p(x)（GF(2), 次数8）"
													value={rsPrimitiveBits}
													onChange={setRsPrimitiveBits}
													disabled={loading}
													required
													kind="coding.channel.rs.primitiveBits"
													suggestedName="p_bits"
													rows={2}
													placeholder="e.g. 1,1,0,1,1,0,0,0,1"
													helpText="定数項→高次（x^0..x^8）の順に 0/1。長さ 9 で入力します。"
												/>
												{rsPrimitiveError ? <Text variant="xs" className="text-brand-danger">{rsPrimitiveError}</Text> : null}
											</Stack>
										) : null}

									{mode === "encode" ? (
										<Stack gap={"sm"}>
											<Flex align="center" justify="between">
												<Text variant="detail" className="flex items-center gap-1">
																		message (hex) <Text span color="danger">*</Text>
												</Text>
												<Flex align="center" gap="xs">
													<VariablePickerIconButton
														kind="coding.channel.rs.messageHex"
														disabled={loading}
														onPick={(e) => setRsMessageHex(e.value)}
													/>
													<SaveVariableIconButton
														kind="coding.channel.rs.messageHex"
														value={rsMessageHex}
														suggestedName="u_hex"
														disabled={loading || rsMessageHex.trim().length === 0}
													/>
													<CopyIconButton text={rsMessageHex} disabled={loading || rsMessageHex.trim().length === 0} />
												</Flex>
											</Flex>
											<Text variant="xs" color="muted">
													長さはちょうど k byte です（hex は 2桁=1byte）。現在: {rsMessageBytesLen ?? "-"} byte
											</Text>
											<Input
												multeline
												rows={4}
												className="font-mono"
												value={rsMessageHex}
												onChange={(e) => setRsMessageHex(e.target.value)}
												placeholder="e.g. 000102..."
												disabled={loading}
											/>
										</Stack>
									) : (
										<Stack gap={"sm"}>
											<Flex align="center" justify="between">
												<Text variant="detail" className="flex items-center gap-1">
																		received (hex) <Text span color="danger">*</Text>
												</Text>
												<Flex align="center" gap="xs">
													<VariablePickerIconButton
														kind="coding.channel.rs.receivedHex"
														disabled={loading}
														onPick={(e) => setRsReceivedHex(e.value)}
													/>
													<SaveVariableIconButton
														kind="coding.channel.rs.receivedHex"
														value={rsReceivedHex}
														suggestedName="r_hex"
														disabled={loading || rsReceivedHex.trim().length === 0}
													/>
													<CopyIconButton text={rsReceivedHex} disabled={loading || rsReceivedHex.trim().length === 0} />
												</Flex>
											</Flex>
											<Text variant="xs" color="muted">
													長さはちょうど n byte です。現在: {rsReceivedBytesLen ?? "-"} byte
											</Text>
											<Input
												multeline
												rows={4}
												className="font-mono"
												value={rsReceivedHex}
												onChange={(e) => setRsReceivedHex(e.target.value)}
												placeholder="e.g. ..."
												disabled={loading}
											/>
										</Stack>
									)}
								</>
							)}

							{scheme === "bch" && (
								<>
									<Stack direction="row" gap={"sm"} className="items-end">
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
									</Stack>

									{bchParamMode === "advanced" ? (
										<Stack gap={"xs"}>
											<GeneratorPolynomialBitsInput
												label="生成多項式 g(x)（係数, 0/1）"
												value={bchG}
												onChange={setBchG}
												disabled={loading}
												required
												kind="coding.channel.bch.generatorBits"
												helpText="例: 1,1,1,0,1 は g(x)=1+x+x^2+x^4（定数項→高次）。"
											/>
											{bchGeneratorError ? <Text variant="xs" className="text-brand-danger">{bchGeneratorError}</Text> : null}
										</Stack>
									) : null}

									{mode === "encode" ? (
										<Stack gap={"sm"}>
											<Flex align="center" justify="between">
												<Text variant="detail" className="flex items-center gap-1">
																		messageBits (0/1) <Text span color="danger">*</Text>
												</Text>
												<Flex align="center" gap="xs">
													<VariablePickerIconButton
														kind="coding.channel.bch.messageBits"
														disabled={loading}
														onPick={(e) => setBchMessageBits(e.value)}
													/>
													<SaveVariableIconButton
														kind="coding.channel.bch.messageBits"
														value={bchMessageBits}
														suggestedName="u_bits"
														disabled={loading || bchMessageBits.trim().length === 0}
													/>
													<CopyIconButton text={bchMessageBits} disabled={loading || bchMessageBits.trim().length === 0} />
												</Flex>
											</Flex>
											<Text variant="xs" color="muted">例: 1011 または 1,0,1,1</Text>
											<Text variant="xs" color="muted">現在: {bchMessageBitsLen ?? "-"} bit</Text>
											<Input
												multeline
												rows={4}
												className="font-mono"
												value={bchMessageBits}
												onChange={(e) => setBchMessageBits(e.target.value)}
												placeholder="e.g. 1,0,1,1"
												disabled={loading}
											/>
										</Stack>
									) : (
										<Stack gap={"sm"}>
											<Flex align="center" justify="between">
												<Text variant="detail" className="flex items-center gap-1">
																		receivedBits (0/1) <Text span color="danger">*</Text>
												</Text>
												<Flex align="center" gap="xs">
													<VariablePickerIconButton
														kind="coding.channel.bch.receivedBits"
														disabled={loading}
														onPick={(e) => setBchReceivedBits(e.value)}
													/>
													<SaveVariableIconButton
														kind="coding.channel.bch.receivedBits"
														value={bchReceivedBits}
														suggestedName="r_bits"
														disabled={loading || bchReceivedBits.trim().length === 0}
													/>
													<CopyIconButton text={bchReceivedBits} disabled={loading || bchReceivedBits.trim().length === 0} />
												</Flex>
											</Flex>
											<Text variant="xs" color="muted">例: 0,1,0,...</Text>
											<Text variant="xs" color="muted">現在: {bchReceivedBitsLen ?? "-"} bit</Text>
											<Input
												multeline
												rows={4}
												className="font-mono"
												value={bchReceivedBits}
												onChange={(e) => setBchReceivedBits(e.target.value)}
												placeholder="e.g. 0,1,0,..."
												disabled={loading}
											/>
										</Stack>
									)}
								</>
							)}
							{scheme === "cyclic" && (
								<>
									<Stack direction="row" gap={"sm"} className="items-end">
										<FormField label="n">
											<Input value={cyclicN} onChange={(e) => setCyclicN(e.target.value)} className="w-28" />
										</FormField>
									</Stack>

										<Stack gap={"xs"}>
											<GeneratorPolynomialBitsInput
												label="生成多項式 g(x)（係数, 0/1）"
												value={cyclicG}
												onChange={setCyclicG}
												disabled={loading}
												required
												kind="coding.channel.cyclic.generatorBits"
												helpText="例: 1,1,0,1 は g(x)=1+x+x^3（定数項→高次）。"
											/>
											{cyclicGeneratorError ? <Text variant="xs" className="text-brand-danger">{cyclicGeneratorError}</Text> : null}
										</Stack>

									{mode === "encode" ? (
										<Stack gap={"sm"}>
											<Flex align="center" justify="between">
												<Text variant="detail" className="flex items-center gap-1">
													messageBits (0/1) <Text span color="danger">*</Text>
												</Text>
												<Flex align="center" gap="xs">
													<VariablePickerIconButton
														kind="coding.channel.cyclic.messageBits"
														disabled={loading}
														onPick={(e) => setCyclicMessageBits(e.value)}
													/>
													<SaveVariableIconButton
														kind="coding.channel.cyclic.messageBits"
														value={cyclicMessageBits}
														suggestedName="u_bits"
														disabled={loading || cyclicMessageBits.trim().length === 0}
													/>
													<CopyIconButton text={cyclicMessageBits} disabled={loading || cyclicMessageBits.trim().length === 0} />
												</Flex>
											</Flex>
											<Text variant="xs" color="muted">例: 1011 または 1,0,1,1</Text>
											<Text variant="xs" color="muted">現在: {cyclicMessageBitsLen ?? "-"} bit</Text>
											<Input
												multeline
												rows={4}
												className="font-mono"
												value={cyclicMessageBits}
												onChange={(e) => setCyclicMessageBits(e.target.value)}
												placeholder="e.g. 1,0,1,1"
												disabled={loading}
											/>
										</Stack>
									) : (
										<Stack gap={"sm"}>
											<Flex align="center" justify="between">
												<Text variant="detail" className="flex items-center gap-1">
													receivedBits (0/1) <Text span color="danger">*</Text>
												</Text>
												<Flex align="center" gap="xs">
													<VariablePickerIconButton
														kind="coding.channel.cyclic.receivedBits"
														disabled={loading}
														onPick={(e) => setCyclicReceivedBits(e.value)}
													/>
													<SaveVariableIconButton
														kind="coding.channel.cyclic.receivedBits"
														value={cyclicReceivedBits}
														suggestedName="r_bits"
														disabled={loading || cyclicReceivedBits.trim().length === 0}
													/>
													<CopyIconButton text={cyclicReceivedBits} disabled={loading || cyclicReceivedBits.trim().length === 0} />
												</Flex>
											</Flex>
											<Text variant="xs" color="muted">例: 0,1,0,...</Text>
											<Text variant="xs" color="muted">現在: {cyclicReceivedBitsLen ?? "-"} bit</Text>
											<Input
												multeline
												rows={4}
												className="font-mono"
												value={cyclicReceivedBits}
												onChange={(e) => setCyclicReceivedBits(e.target.value)}
												placeholder="e.g. 0,1,0,..."
												disabled={loading}
											/>
										</Stack>
									)}
								</>
							)}

						</Stack>
					}
					action={
										<Stack gap={"sm"} align="start">
											<Button type="button" size="md" className="w-auto" onClick={run} disabled={!canRun}>
								{loading ? <Spinner size="sm" /> : "実行"}
							</Button>
							{mode === "encode" && scheme !== "hamming74" ? (
												<Button type="button" size="md" className="w-auto" variant="outline" onClick={verify} disabled={!canVerify}>
									{loading ? <Spinner size="sm" /> : "BSC検証"}
								</Button>
							) : null}
							{error && <Text className="text-brand-danger">{error}</Text>}
						</Stack>
					}
					output={
						<Stack gap={"md"}>
							<Stack gap={"sm"}>
								<Text variant="detail">結果</Text>
								<Text variant="xs" color="muted">Encode/Decode の結果を表示します。</Text>
							</Stack>

							{scheme === "rs" ? (
								<>
									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">符号語（n byte, hex）</Text>
											<Flex align="center" gap="xs">
												<SaveVariableIconButton
													kind="coding.channel.rs.codewordHex"
													value={encodedOut}
													suggestedName="c_hex"
													disabled={loading || encodedOut.trim().length === 0}
												/>
												<CopyIconButton text={encodedOut} disabled={loading || encodedOut.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className="font-mono" value={encodedOut} placeholder="-" />
									</Stack>

									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">復号結果（k byte, hex）</Text>
											<Flex align="center" gap="xs">
												<SaveVariableIconButton
													kind="coding.channel.rs.decodedMessageHex"
													value={decodedOut}
													suggestedName="u_hat_hex"
													disabled={loading || decodedOut.trim().length === 0}
												/>
												<CopyIconButton text={decodedOut} disabled={loading || decodedOut.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className="font-mono" value={decodedOut} placeholder="-" />
									</Stack>
								</>
							) : null}

							{scheme === "bch" ? (
								<>
									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">符号語（n bit, CSV）</Text>
											<Flex align="center" gap="xs">
												<SaveVariableIconButton
													kind="coding.channel.bch.codewordBits"
													value={encodedOut}
													suggestedName="c_bits"
													disabled={loading || encodedOut.trim().length === 0}
												/>
												<CopyIconButton text={encodedOut} disabled={loading || encodedOut.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className="font-mono" value={encodedOut} placeholder="-" />
									</Stack>

									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">復号結果（訂正後コード語, n bit）</Text>
											<Flex align="center" gap="xs">
												<SaveVariableIconButton
													kind="coding.channel.bch.correctedBits"
													value={decodedOut}
													suggestedName="corr_bits"
													disabled={loading || decodedOut.trim().length === 0}
												/>
												<CopyIconButton text={decodedOut} disabled={loading || decodedOut.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className="font-mono" value={decodedOut} placeholder="-" />
									</Stack>

									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">復元メッセージ（各ブロック末尾 k bit）</Text>
											<Flex align="center" gap="xs">
												<SaveVariableIconButton
													kind="coding.channel.bch.recoveredBits"
													value={decodedOut2}
													suggestedName="u_hat_bits"
													disabled={loading || decodedOut2.trim().length === 0}
												/>
												<CopyIconButton text={decodedOut2} disabled={loading || decodedOut2.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className="font-mono" value={decodedOut2} placeholder="-" />
									</Stack>
								</>
							) : null}

												{scheme === "cyclic" ? (
													<>
														<Stack gap={"sm"}>
															<Flex align="center" justify="between">
																<Text variant="detail">符号語（n bit, CSV）</Text>
																<Flex align="center" gap="xs">
																	<SaveVariableIconButton
																		kind="coding.channel.cyclic.codewordBits"
																		value={encodedOut}
																		suggestedName="c_bits"
																		disabled={loading || encodedOut.trim().length === 0}
																	/>
																	<CopyIconButton text={encodedOut} disabled={loading || encodedOut.trim().length === 0} />
																</Flex>
															</Flex>
															<Input multeline rows={4} readOnly className="font-mono" value={encodedOut} placeholder="-" />
														</Stack>

														<Stack gap={"sm"}>
															<Flex align="center" justify="between">
																<Text variant="detail">復号結果（訂正後コード語, n bit）</Text>
																<Flex align="center" gap="xs">
																	<SaveVariableIconButton
																		kind="coding.channel.cyclic.correctedBits"
																		value={decodedOut}
																		suggestedName="corr_bits"
																		disabled={loading || decodedOut.trim().length === 0}
																	/>
																	<CopyIconButton text={decodedOut} disabled={loading || decodedOut.trim().length === 0} />
																</Flex>
															</Flex>
															<Input multeline rows={4} readOnly className="font-mono" value={decodedOut} placeholder="-" />
														</Stack>

														<Stack gap={"sm"}>
															<Flex align="center" justify="between">
																<Text variant="detail">復元メッセージ（c(x) / g(x) の商）</Text>
																<Flex align="center" gap="xs">
																	<SaveVariableIconButton
																		kind="coding.channel.cyclic.recoveredBits"
																		value={decodedOut2}
																		suggestedName="u_hat_bits"
																		disabled={loading || decodedOut2.trim().length === 0}
																	/>
																	<CopyIconButton text={decodedOut2} disabled={loading || decodedOut2.trim().length === 0} />
																</Flex>
															</Flex>
															<Input multeline rows={4} readOnly className="font-mono" value={decodedOut2} placeholder="-" />
														</Stack>
													</>
												) : null}

							{scheme === "hamming74" ? (
								<Stack gap={"sm"}>
									<Flex align="center" justify="between">
										<Text variant="detail">符号語（7 bit, CSV）</Text>
										<Flex align="center" gap="xs">
											<SaveVariableIconButton
												kind="coding.channel.hamming74.codewordBits"
												value={encodedOut}
												suggestedName="c_bits"
												disabled={loading || encodedOut.trim().length === 0}
											/>
											<CopyIconButton text={encodedOut} disabled={loading || encodedOut.trim().length === 0} />
										</Flex>
									</Flex>
									<Input multeline rows={4} readOnly className="font-mono" value={encodedOut} placeholder="-" />
								</Stack>
							) : null}

							{mode === "encode" && scheme !== "hamming74" ? (
								<Stack gap={"sm"}>
									<Text weight="bold" variant="body">検証（BSC）</Text>
									<Stack gap={"sm"}>
										<Stack direction="row" gap={"sm"} className="items-end">
											<FormField label="誤り確率 p (0〜1)">
												<Input value={bscP} onChange={(e) => setBscP(e.target.value)} className="w-40" />
											</FormField>
										</Stack>
										{verifyMetrics ? <Text color={"muted"}>{verifyMetrics}</Text> : <Text color={"muted"}>BSC を通して復号し、メッセージ一致/BER を確認します。</Text>}
									</Stack>

									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">受信語（BSC 後）</Text>
											<Flex align="center" gap="xs">
																	<SaveVariableIconButton
																		kind={
																		scheme === "rs"
																			? "coding.channel.rs.noisyHex"
																			: scheme === "bch"
																				? "coding.channel.bch.noisyBits"
																				: "coding.channel.cyclic.noisyBits"
																		}
													value={verifyNoisy}
													suggestedName="r_noisy"
													disabled={loading || verifyNoisy.trim().length === 0}
												/>
												<CopyIconButton text={verifyNoisy} disabled={loading || verifyNoisy.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className="font-mono" value={verifyNoisy} placeholder="-" />
									</Stack>

									<Stack gap={"sm"}>
										<Flex align="center" justify="between">
											<Text variant="detail">復元メッセージ</Text>
											<Flex align="center" gap="xs">
																	<SaveVariableIconButton
																		kind={
																		scheme === "rs"
																			? "coding.channel.rs.decodedMessageHex"
																			: scheme === "bch"
																				? "coding.channel.bch.recoveredBits"
																				: "coding.channel.cyclic.recoveredBits"
																		}
													value={verifyRecovered}
													suggestedName="u_hat"
													disabled={loading || verifyRecovered.trim().length === 0}
												/>
												<CopyIconButton text={verifyRecovered} disabled={loading || verifyRecovered.trim().length === 0} />
											</Flex>
										</Flex>
										<Input multeline rows={4} readOnly className={scheme === "rs" ? "font-mono" : "font-mono"} value={verifyRecovered} placeholder="-" />
									</Stack>
								</Stack>
							) : null}
						</Stack>
					}
				/>
			</Stack>
		</Stack>
	);
};
