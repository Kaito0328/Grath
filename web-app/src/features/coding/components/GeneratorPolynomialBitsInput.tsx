"use client";

import { useMemo } from "react";
import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Text } from "../../../design/baseComponents/Text";
import { Input } from "../../../design/baseComponents/Input";
import { parseBits01 } from "../../../shared/utils/bits";
import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";

export type GeneratorPolynomialBitsInputProps = {
	label: string;
	value: string;
	onChange: (next: string) => void;
	disabled?: boolean;
	required?: boolean;
	kind: string;
	suggestedName?: string;
	rows?: number;
	placeholder?: string;
	helpText?: string;
};

export const GeneratorPolynomialBitsInput = ({
	label,
	value,
	onChange,
	disabled,
	required,
	kind,
	suggestedName = "g_bits",
	rows = 3,
	placeholder = "e.g. 1,1,0,1",
	helpText,
}: GeneratorPolynomialBitsInputProps) => {
	const len = useMemo(() => {
		try {
			return parseBits01(value).length;
		} catch {
			return null;
		}
	}, [value]);

	return (
		<Stack gap={"sm"}>
			<Flex align="center" justify="between">
				<Text variant="detail" className="flex items-center gap-1">
					{label} {required ? <Text span color="danger">*</Text> : null}
				</Text>
				<Flex align="center" gap="xs">
					<VariablePickerIconButton kind={kind} disabled={disabled} onPick={(e) => onChange(e.value)} />
					<SaveVariableIconButton kind={kind} value={value} suggestedName={suggestedName} disabled={disabled || value.trim().length === 0} />
					<CopyIconButton text={value} disabled={disabled || value.trim().length === 0} />
				</Flex>
			</Flex>
			<Text variant="xs" color="muted">
				{helpText ?? "定数項→高次の順に 0/1 で入力します。"} 現在: {len ?? "-"} bit
			</Text>
			<Input
				multeline
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
