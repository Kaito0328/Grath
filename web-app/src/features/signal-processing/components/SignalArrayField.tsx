"use client";

import { type ReactNode, useMemo, useState } from "react";
import { FormField } from "../../../design/baseComponents/FormField";
import { TextArea } from "../../../design/baseComponents/TextArea";
import { Stack } from "../../../design/primitives/Stack";
import { Button } from "../../../design/baseComponents/Button";
import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { SignalGeneratorModal } from "./SignalGeneratorModal";
import { parseNumberList } from "../utils/numberList";
import { Markdown } from "../../../design/baseComponents/Markdown";

export interface SignalArrayFieldProps {
	label: string;
	symbolLatex?: string;
	kind: string;
	value: string;
	onChange: (next: string) => void;
	suggestedSaveName?: string;
	showGenerator?: boolean;
	extraActions?: ReactNode;
}

export const SignalArrayField = ({
	label,
	kind,
	value,
	onChange,
	suggestedSaveName,
	showGenerator = true,
	symbolLatex,
	extraActions,
}: SignalArrayFieldProps) => {
	const [genOpen, setGenOpen] = useState(false);

	const count = useMemo(() => {
		const parsed = parseNumberList(value);
		return parsed.error ? null : parsed.values.length;
	}, [value]);

	const countSuffix = count === null ? "" : ` (${count}点)`;
	const labelText = symbolLatex ? `${label} $${symbolLatex}$${countSuffix}` : `${label}${countSuffix}`;

	return (
		<FormField>
			<Stack gap="sm">
				<Stack direction="row" gap="sm" className="items-center justify-between">
					{symbolLatex ? (
						<Markdown
							bg="transparent"
							padding="none"
							className="text-sm text-foreground [&>p]:m-0"
						>
							{labelText}
						</Markdown>
					) : (
						<Markdown bg="transparent" padding="none" className="text-sm text-foreground [&>p]:m-0">
							{labelText}
						</Markdown>
					)}

					<Stack direction="row" gap="sm" className="justify-end">
						{extraActions}
						{showGenerator ? (
							<Button variant="outline" onClick={() => setGenOpen(true)}>
								生成
							</Button>
						) : null}
						<VariablePickerIconButton kind={kind} onPick={(e) => onChange(e.value)} />
						<SaveVariableIconButton kind={kind} value={value} suggestedName={suggestedSaveName} />
					</Stack>
				</Stack>

				<TextArea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="例: 1, 2, 3"
					rows={6}
				/>
			</Stack>

			<SignalGeneratorModal open={genOpen} onClose={() => setGenOpen(false)} onApply={(text) => onChange(text)} />
		</FormField>
	);
};
