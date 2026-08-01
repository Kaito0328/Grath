"use client";
import { Stack } from "../../design/primitives/Stack";

import { useMemo, useState } from "react";
import { Drawer } from "../../design/baseComponents/Drawer";
import { IconButton } from "../../design/baseComponents/IconButton";
import { Input } from "../../design/baseComponents/Input";
import { Select } from "../../design/baseComponents/Select";
import { TextArea } from "../../design/baseComponents/TextArea";
import { Copy as CopyIcon, Edit2 as EditIcon, Trash2 as TrashIcon } from 'lucide-react';
import { Text } from "../../design/baseComponents/Text";

import { View } from "../../design/primitives/View";
import { useVariableManagerStore } from "../../stores/variableManager/store";
import type { VariableEntry, VariableKind } from "../../stores/variableManager/types";

import { algebraicKindLabelMap } from "../../features/algebraic/config/kindLabels";
import { statisticsKindLabelMap } from "../../features/statistics/config/kindLabels";
import { VariableValuePreview } from "./VariableValuePreview";
import { algebraicErrorToDisplayMessage } from "../../features/algebraic/config/errorCodeMessages";
import { formatKindLabelEn, formatKindLabelPlain, type KindLabelMap } from "../kinds/kindLabels";

import {
	formatRational,
	formatSymbolicComplex,
	parseRationalFromLatex,
	parseSymbolicComplexFromLatex,
	rationalToLatex,
	symbolicComplexToLatex,
} from "../algebraic/algebraicClient";

import { Rational, SymbolicComplex } from "@my-project/client-sdk/api/algebraicApi";

import { RationalInput } from "../../features/algebraic/types/RationalInput";
import { SymbolicComplexInput } from "../../features/algebraic/types/SymbolicComplexInput";
import { Button } from "../../design/baseComponents/Button";
type SortKey = "createdAt" | "updatedAt" | "lastUsedAt" | "name";

type SortDir = "asc" | "desc";

type InputMode = "normal" | "latex";

type ViewMode = "byKind" | "flat";

const variableManagerKindLabelMap: KindLabelMap = {
	...algebraicKindLabelMap,
	...statisticsKindLabelMap,
	"signalProcessing.signal": {
		symbol: "s",
		en: "Signal",
		ja: "信号",
	},
	"polynomial.coeffs": {
		symbol: "P",
		en: "Polynomial (coefficients)",
		ja: "多項式（係数）",
	},
	"linalg.matrix": {
		symbol: "M",
		en: "Matrix",
		ja: "行列",
	},
	"linalg.vector": {
		symbol: "v",
		en: "Vector",
		ja: "ベクトル",
	},
	"coding.source.text": {
		symbol: "S",
		en: "Source Text",
		ja: "テキスト",
	},
	"coding.source.hex": {
		symbol: "H",
		en: "Source Hex",
		ja: "hex",
	},
	"coding.channel.hamming74.messageBits": {
		symbol: "u",
		en: "Hamming(7,4) message",
		ja: "Hamming 入力 (4bit)",
	},
	"coding.channel.hamming74.codewordBits": {
		symbol: "c",
		en: "Hamming(7,4) codeword",
		ja: "Hamming 符号語 (7bit)",
	},
	"coding.channel.rs.messageHex": {
		symbol: "u",
		en: "RS message (hex)",
		ja: "RS メッセージ (hex)",
	},
	"coding.channel.rs.receivedHex": {
		symbol: "r",
		en: "RS received (hex)",
		ja: "RS 受信語 (hex)",
	},
	"coding.channel.rs.codewordHex": {
		symbol: "c",
		en: "RS codeword (hex)",
		ja: "RS 符号語 (hex)",
	},
	"coding.channel.rs.noisyHex": {
		symbol: "r",
		en: "RS noisy received (hex)",
		ja: "RS 受信語 (BSC後, hex)",
	},
	"coding.channel.rs.decodedMessageHex": {
		symbol: "û",
		en: "RS recovered message (hex)",
		ja: "RS 復元メッセージ (hex)",
	},
	"coding.channel.bch.messageBits": {
		symbol: "u",
		en: "BCH message (bits)",
		ja: "BCH メッセージ (bits)",
	},
	"coding.channel.bch.receivedBits": {
		symbol: "r",
		en: "BCH received (bits)",
		ja: "BCH 受信語 (bits)",
	},
	"coding.channel.bch.codewordBits": {
		symbol: "c",
		en: "BCH codeword (bits)",
		ja: "BCH 符号語 (bits)",
	},
	"coding.channel.bch.noisyBits": {
		symbol: "r",
		en: "BCH noisy received (bits)",
		ja: "BCH 受信語 (BSC後, bits)",
	},
	"coding.channel.bch.correctedBits": {
		symbol: "ĉ",
		en: "BCH corrected codeword (bits)",
		ja: "BCH 訂正後コード語 (bits)",
	},
	"coding.channel.bch.recoveredBits": {
		symbol: "û",
		en: "BCH recovered message (bits)",
		ja: "BCH 復元メッセージ (bits)",
	},
};

function formatTime(ts?: number) {
	if (!ts) return "-";
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(ts));
}

function sortEntries(entries: VariableEntry[], key: SortKey, dir: SortDir) {
	const factor = dir === "asc" ? 1 : -1;

	return entries
		.slice()
		.sort((a, b) => {
			if (key === "name") return factor * a.name.localeCompare(b.name);

			const av = key === "lastUsedAt" ? a.lastUsedAt ?? 0 : a[key];
			const bv = key === "lastUsedAt" ? b.lastUsedAt ?? 0 : b[key];
			return factor * (av - bv);
		});
}

export interface VariableManagerPanelProps {
	showHeader?: boolean;
}

export const VariableManagerPanel = ({ showHeader = true }: VariableManagerPanelProps) => {
	const entries = useVariableManagerStore((s) => s.entries);
	const save = useVariableManagerStore((s) => s.save);
	const update = useVariableManagerStore((s) => s.update);
	const removeById = useVariableManagerStore((s) => s.removeById);
	const touch = useVariableManagerStore((s) => s.touch);

	const [kindFilter, setKindFilter] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("byKind");
	const [sortKey, setSortKey] = useState<SortKey>("createdAt");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftKind, setDraftKind] = useState<VariableKind>("algebraic.symbolicComplex");
	const [draftInputMode, setDraftInputMode] = useState<InputMode>("normal");
	const [draftName, setDraftName] = useState<string>("");
	const [draftLatex, setDraftLatex] = useState<string>("");

	const [draftComplex, setDraftComplex] = useState<SymbolicComplex | null>(null);
	const [draftRational, setDraftRational] = useState<Rational | null>(null);

	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const kindOptions = useMemo(() => {
		const kinds = Array.from(
			new Set(
				entries.map((e) => e.kind)
			)
		).sort((a, b) => a.localeCompare(b));
		return [
			{ value: "all", label: "すべて" },
			...kinds.map((k) => ({ value: k, label: formatKindLabelPlain(variableManagerKindLabelMap, k) })),
		];
	}, [entries]);

	const editorKindOptions = useMemo(() => {
		const known: VariableKind[] = [
			"algebraic.rational",
			"algebraic.symbolicComplex",
		];
		const seen = Array.from(new Set(entries.map((e) => e.kind)));
		const all = Array.from(new Set([...known, ...seen])).sort((a, b) => a.localeCompare(b));
		return all.map((k) => ({ value: k, label: formatKindLabelPlain(variableManagerKindLabelMap, k) }));
	}, [entries]);

	const visibleEntries = useMemo(() => {
		const filtered = kindFilter === "all" ? entries : entries.filter((e) => e.kind === kindFilter);
		return sortEntries(filtered, sortKey, sortDir);
	}, [entries, kindFilter, sortKey, sortDir]);

	const groupedEntries = useMemo(() => {
		if (viewMode !== "byKind") return [] as Array<{ kind: VariableKind; label: string; items: VariableEntry[] }>;

		const map = new Map<VariableKind, VariableEntry[]>();
		for (const e of visibleEntries) {
			const arr = map.get(e.kind) ?? [];
			arr.push(e);
			map.set(e.kind, arr);
		}

		const groups = Array.from(map.entries()).map(([kind, items]) => ({
			kind,
			label: formatKindLabelPlain(variableManagerKindLabelMap, kind),
			items,
		}));
		groups.sort((a, b) => a.label.localeCompare(b.label));
		return groups;
	}, [viewMode, visibleEntries]);

	const canSubmit = useMemo(() => {
		if (submitting) return false;
		if (draftKind.trim().length === 0) return false;
		if (draftName.trim().length === 0) return false;
		if (draftInputMode === "latex") return draftLatex.trim().length > 0;

		if (draftKind === "algebraic.symbolicComplex") return draftComplex !== null && draftComplex.toString().trim().length > 0;
		if (draftKind === "algebraic.rational") {
			return (
				draftRational !== null &&
				Number.isFinite(Number(draftRational.toDTO().numer)) &&
				Number.isFinite(Number(draftRational.toDTO().denom)) &&
				String(draftRational.toDTO().denom) !== "0"
			);
		}
		return true;
	}, [
		draftKind,
		draftName,
		draftInputMode,
		draftLatex,
		draftComplex,
		draftRational,
		submitting,
	]);

	function resetDraft() {
		setEditingId(null);
		setSubmitError(null);
		setDraftName("");
		setDraftComplex(null);
		setDraftRational(null);
		setDraftInputMode("normal");
		setDraftLatex("");
		setDrawerOpen(false);
	}

	function startNew() {
		setEditingId(null);
		setDraftKind("algebraic.symbolicComplex");
		setDraftInputMode("normal");
		setDraftName("");
		setDraftComplex(null);
		setDraftRational(null);
		setDraftLatex("");
		setSubmitError(null);
		setDrawerOpen(true);
	}

	function startEdit(entry: VariableEntry) {
		setEditingId(entry.id);
		setDraftKind(entry.kind);
		setDraftInputMode("normal");
		setDraftName(entry.name);
		setDraftLatex(entry.latex ?? "");
		setSubmitError(null);

		if (entry.kind === "algebraic.symbolicComplex") {
			SymbolicComplex.fromString(entry.value).then(setDraftComplex).catch(() => setDraftComplex(null));
		}
		if (entry.kind === "algebraic.rational") {
			const parts = entry.value.split("/");
			if (parts.length === 2) {
				const numer = Number(parts[0].trim());
				const denom = Number(parts[1].trim());
				Rational.tryNew(Number.isFinite(numer) ? numer : Number.NaN, Number.isFinite(denom) ? denom : Number.NaN)
					.then(setDraftRational)
					.catch(() => setDraftRational(null));
			} else {
				setDraftRational(null);
			}
		}
		setDrawerOpen(true);
	}

	function onChangeDraftKind(next: VariableKind) {
		// Editing: keep kind stable (changing kind effectively creates a different variable).
		if (editingId) return;
		setDraftKind(next);
		// Keep name, but reset value fields.
		setDraftComplex(null);
		setDraftRational(null);
		setDraftLatex("");
		setDraftInputMode("normal");
		setSubmitError(null);
	}

	async function onSubmit() {
		const kind = draftKind.trim();
		const name = draftName.trim();
		if (!kind || !name) return;

		setSubmitError(null);
		setSubmitting(true);
		try {
			let valueText = "";
			let latex: string | undefined;

			if (draftInputMode === "normal") {
				if (kind === "algebraic.symbolicComplex") {
					if (!draftComplex) throw new Error("Invalid complex");
					valueText = draftComplex.toString();
					latex = await draftComplex.toLatex();
				} else if (kind === "algebraic.rational") {
					if (!draftRational) throw new Error("Invalid rational");
					valueText = `${draftRational.toDTO().numer}/${draftRational.toDTO().denom}`;
					latex = await draftRational.toLatex();
				} else {
					throw new Error("この型は通常モード未対応です");
				}
			} else {
				const latexRaw = draftLatex.trim();
				if (!latexRaw) throw new Error("LaTeXが空です");

				if (kind === "algebraic.symbolicComplex") {
					const parsed = await parseSymbolicComplexFromLatex(latexRaw);
					valueText = formatSymbolicComplex(parsed);
					latex = await symbolicComplexToLatex(parsed);
				} else if (kind === "algebraic.rational") {
					const parsed = await parseRationalFromLatex(latexRaw);
					valueText = formatRational(parsed);
					latex = await rationalToLatex(parsed);
				} else {
					throw new Error("この型はLaTeXモード未対応です");
				}
			}

			if (editingId) {
				update(editingId, { kind, name, value: valueText, latex });
				resetDraft();
				return;
			}

			save({ kind, name, value: valueText, latex });
			resetDraft();
		} catch (e) {
			setSubmitError(algebraicErrorToDisplayMessage(e));
		} finally {
			setSubmitting(false);
		}
	}

	async function onCopy(entry: VariableEntry) {
		try {
			await navigator.clipboard.writeText(entry.value);
			touch(entry.id);
		} catch {
			// clipboard が使えない環境向け: 何もしない
		}
	}

	function onDelete(entry: VariableEntry) {
		if (!confirm(`変数「${entry.name}」を削除しますか？`)) return;
		removeById(entry.id);
		if (editingId === entry.id) resetDraft();
	}

	return (
		<Stack gap={"lg"}>
			{showHeader && (
				<Stack gap={"sm"}>
					<Text>変数管理</Text>
					<Text color={"muted"}>
						保存した変数の一覧・フィルタ・ソート・編集ができます。
					</Text>
				</Stack>
			)}

			<Stack gap={"md"}>
				<Stack direction="row" gap={"sm"} className="flex-wrap">
					<Stack gap={"sm"} className="min-w-[180px]">
						<Text color={"muted"}>
							表示
						</Text>
						<Select
							value={viewMode}
							onChange={(e) => setViewMode(e.target.value as ViewMode)}
							options={[
								{ value: "byKind", label: "型ごと" },
								{ value: "flat", label: "まとめて" },
							]}
						/>
					</Stack>

					<Stack gap={"sm"} className="min-w-[180px]">
						<Text color={"muted"}>
							型
						</Text>
						<Select
							value={kindFilter}
							onChange={(e) => setKindFilter(e.target.value)}
							options={kindOptions}
						/>
					</Stack>

					<Stack gap={"sm"} className="min-w-[180px]">
						<Text color={"muted"}>
							ソート
						</Text>
						<Select
							value={sortKey}
							onChange={(e) => setSortKey(e.target.value as SortKey)}
							options={[
								{ value: "createdAt", label: "作成日" },
								{ value: "updatedAt", label: "更新日" },
								{ value: "lastUsedAt", label: "呼び出し日" },
								{ value: "name", label: "名前" },
							]}
						/>
					</Stack>

					<Stack gap={"sm"} className="min-w-[140px]">
						<Text color={"muted"}>
							順序
						</Text>
						<Select
							value={sortDir}
							onChange={(e) => setSortDir(e.target.value as SortDir)}
							options={[
								{ value: "desc", label: "新しい順" },
								{ value: "asc", label: "古い順" },
							]}
						/>
					</Stack>

					<Button color="primary" variant="outline" onClick={startNew}>
						<Text>
							+ 新規
						</Text>
					</Button>
				</Stack>
			</Stack>

			<Stack gap={"sm"}>
				<Text>一覧 ({visibleEntries.length})</Text>
				{visibleEntries.length === 0 ? (
					<Text color={"muted"}>まだ変数がありません。</Text>
				) : viewMode === "flat" ? (
					<Stack gap={"sm"}>
						{visibleEntries.map((entry) => (
							<View
								key={entry.id}
								border="base"
								rounded="md"
								bg={"primary"}
								padding={"md"}
							>
								<Stack gap={"sm"}>
									<Stack direction="row" gap={"sm"}>
										<Stack gap={"sm"}>
											<Stack direction="row" gap={"sm"} className="flex-wrap">
												<Text>{entry.name}</Text>
												<Text color={"muted"} className="leading-none">
													({formatKindLabelEn(variableManagerKindLabelMap, entry.kind)})
												</Text>
											</Stack>
										</Stack>

										<Stack direction="row" gap={"sm"}>
											<IconButton onClick={() => void onCopy(entry)}>
												<CopyIcon className="h-5 w-5" />
											</IconButton>
											<IconButton
												onClick={() => startEdit(entry)}
												color={"primary"}
											>
												<EditIcon className="h-5 w-5" />
											</IconButton>
											<IconButton
												onClick={() => onDelete(entry)}
												color={"danger"}
											>
												<TrashIcon className="h-5 w-5" />
											</IconButton>
										</Stack>
									</Stack>

									<VariableValuePreview kind={entry.kind} value={entry.value} latex={entry.latex} />

									<Stack direction="row">
										<Text color={"muted"}>
											作成: {formatTime(entry.createdAt)} / 更新: {formatTime(entry.updatedAt)} / 呼び出し: {formatTime(entry.lastUsedAt)}
										</Text>
									</Stack>
								</Stack>
							</View>
						))}
					</Stack>
				) : (
					<Stack gap={"sm"}>
						{groupedEntries.map((g) => (
							<Stack key={g.kind} gap={"sm"}>
								<Stack direction="row" gap={"sm"} className="items-end flex-wrap">
									<Text>{g.label}</Text>
									<Text color={"muted"}>({g.items.length})</Text>
								</Stack>
								<Stack gap={"sm"}>
									{g.items.map((entry) => (
										<View
											key={entry.id}
											border="base"
											rounded="md"
											bg={"primary"}
											padding={"md"}
										>
											<Stack gap={"sm"}>
												<Stack direction="row" gap={"sm"}>
													<Stack gap={"sm"}>
														<Stack direction="row" gap={"sm"} className="flex-wrap">
															<Text>{entry.name}</Text>
															<Text color={"muted"} className="leading-none">
																({formatKindLabelEn(variableManagerKindLabelMap, entry.kind)})
															</Text>
														</Stack>
													</Stack>

													<Stack direction="row" gap={"sm"}>
														<IconButton onClick={() => void onCopy(entry)}>
															<CopyIcon className="h-5 w-5" />
														</IconButton>
														<IconButton
															onClick={() => startEdit(entry)}
															color={"primary"}
														>
															<EditIcon className="h-5 w-5" />
														</IconButton>
														<IconButton
															onClick={() => onDelete(entry)}
															color={"danger"}
														>
															<TrashIcon className="h-5 w-5" />
														</IconButton>
													</Stack>
												</Stack>

												<VariableValuePreview kind={entry.kind} value={entry.value} latex={entry.latex} />

												<Stack direction="row">
													<Text color={"muted"}>
														作成: {formatTime(entry.createdAt)} / 更新: {formatTime(entry.updatedAt)} / 呼び出し: {formatTime(entry.lastUsedAt)}
													</Text>
												</Stack>
											</Stack>
										</View>
									))}
								</Stack>
							</Stack>
						))}
					</Stack>
				)}
			</Stack>

			<Drawer
				open={drawerOpen}
				title={editingId ? "編集" : "追加"}
				onClose={() => setDrawerOpen(false)}
				placement="right"
			>
				<Stack gap={"md"}>
					<Stack gap={"sm"}>
						<Text color={"muted"}>
							型
						</Text>
						<Select
							value={draftKind}
							disabled={!!editingId}
							onChange={(e) => onChangeDraftKind(e.target.value as VariableKind)}
							options={editorKindOptions}
						/>
					</Stack>

					<Stack gap={"sm"}>
						<Text color={"muted"}>
							名前
						</Text>
						<Input
							value={draftName}
							onChange={(e) => setDraftName(e.target.value)}
							placeholder="例: x"
						/>
					</Stack>

					<Stack gap={"sm"}>
						<Text color={"muted"}>
							入力モード
						</Text>
						<Stack direction="row" gap={"sm"} className="flex-wrap">
							<Button
								type="button"
								size="sm"
								color={draftInputMode === "normal" ? "primary" : "secondary"}
								variant="outline"
								aria-pressed={draftInputMode === "normal"}
								onClick={() => setDraftInputMode("normal")}
							>
								Graphic
							</Button>
							<Button
								type="button"
								size="sm"
								color={draftInputMode === "latex" ? "primary" : "secondary"}
								variant="outline"
								aria-pressed={draftInputMode === "latex"}
								onClick={() => setDraftInputMode("latex")}
							>
								LaTeX
							</Button>
						</Stack>
					</Stack>

					{draftInputMode === "normal" ? (
						<Stack gap={"sm"}>
							<Text color={"muted"}>
								値
							</Text>
							{draftKind === "algebraic.rational" ? (
								<RationalInput
									label={null}
									value={draftRational}
									onChange={setDraftRational}
									onRequestSave={() => { }}
									showActions={false}
									frame={false}
								/>
							) : draftKind === "algebraic.symbolicComplex" ? (
								<SymbolicComplexInput
									label={null}
									value={draftComplex}
									onChange={setDraftComplex}
									onRequestSave={() => { }}
									showActions={false}
									frame={false}
								/>
							) : (
								<Text color={"muted"}>この型の入力UIは未対応です。</Text>
							)}
						</Stack>
					) : (
						<Stack gap={"sm"}>
							<Text color={"muted"}>
								LaTeX
							</Text>
							<TextArea
								value={draftLatex}
								onChange={(e) => setDraftLatex(e.target.value)}
								placeholder="例: \\frac{1}{2} + x"
							/>
						</Stack>
					)}

					{submitError ? (
						<View
							border="base"
							rounded="md"
							bg={"primary"}
							padding={"md"}
						>
							<Text color={"danger"}>
								{submitError}
							</Text>
						</View>
					) : null}

					<Stack direction="row" gap={"sm"}>
						<Button color="secondary" variant="outline" onClick={resetDraft}>
							キャンセル
						</Button>
						<Button onClick={() => void onSubmit()} disabled={!canSubmit} loading={submitting}>
							{editingId ? "更新" : "保存"}
						</Button>
					</Stack>
				</Stack>
			</Drawer>
		</Stack>
	);
};
