"use client";
import { Stack } from "../../design/primitives/Stack";

import { useMemo, useState } from "react";

import { Drawer } from "../../design/baseComponents/Drawer";
import { IconButton } from "../../design/baseComponents/IconButton";
import { Input } from "../../design/baseComponents/Input";
import { ArrowDown } from 'lucide-react';
const ArrowDownIcon = ArrowDown;
import { Text } from "../../design/baseComponents/Text";

import { View } from "../../design/primitives/View";







import { useVariableManagerStore } from "../../stores/variableManager/store";
import type { VariableEntry } from "../../stores/variableManager/types";

import { VariableValuePreview } from "./VariableValuePreview";


export interface VariablePickerIconButtonProps {
	kind: string;
	label?: string;
	disabled?: boolean;
	onPick: (entry: VariableEntry) => void | Promise<void>;
}

export const VariablePickerIconButton = ({
	kind,
	disabled,
	onPick,
}: VariablePickerIconButtonProps) => {
	const [open, setOpen] = useState(false);
	const [q, setQ] = useState("");

	const entries = useVariableManagerStore((s) => s.entries);
	const touch = useVariableManagerStore((s) => s.touch);

	const items = useMemo(() => {
		const filtered = entries
			.filter((e) => e.kind === kind)
			.filter((e) => {
				const query = q.trim().toLowerCase();
				if (!query) return true;
				return e.name.toLowerCase().includes(query) || e.value.toLowerCase().includes(query);
			});

		return filtered.sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || b.updatedAt - a.updatedAt);
	}, [entries, kind, q]);

	async function pick(entry: VariableEntry) {
		await onPick(entry);
		touch(entry.id);
		setOpen(false);
	}

	return (
		<>
			<IconButton onClick={() => setOpen(true)} disabled={disabled} title={`変数を呼び出し (${kind})`}>
				<ArrowDownIcon className="h-5 w-5" />
			</IconButton>

			<Drawer open={open} title="変数を呼び出し" onClose={() => setOpen(false)} placement="right">
				<Stack gap={"md"}>
					<Text variant="xs" color="muted" className="text-right">
						型: {kind}
					</Text>

					<Stack gap={"sm"}>
						<Text color={"muted"}>
							検索
						</Text>
						<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="名前 / 値" />
					</Stack>

					{items.length === 0 ? (
						<Text color={"muted"}>該当する変数がありません。</Text>
					) : (
						<Stack gap={"sm"}>
							{items.map((e) => (
								<View
									key={e.id}
									border="base"
									rounded="md"
									bg={"primary"}

									padding={"md"}
									className="cursor-pointer transition-colors"
									onClick={() => void pick(e)}
								>
									<Stack gap={"sm"}>
										<Stack direction="row" gap={"sm"}>
											<Text>{e.name}</Text>
											<Text color={"muted"}>
												click
											</Text>
										</Stack>
										<VariableValuePreview kind={e.kind} value={e.value} latex={e.latex} />
										<Text variant="xs" color="muted" className="text-right">
											型: {e.kind}
										</Text>
									</Stack>
								</View>
							))}
						</Stack>
					)}
				</Stack>
			</Drawer>
		</>
	);
};
