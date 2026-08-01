import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { View } from "../../../design/primitives/View";
import { Grid } from "../../../design/primitives/Grid";

import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";

import { MatrixCell } from "./MatrixCell";
import { LinalgCoeffType } from "../LinalgOperations";

type VectorInputProps = {
	label: string;
	dim: number;
	data: string[];
	onChange: (i: number, v: string) => void;
	onResize: (dim: number) => void;
	coeffType: LinalgCoeffType;
};

const splitVectorLike = (raw: string) =>
	(raw ?? "")
		.split(/[;,\n]/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

export const VectorInput = ({ label, dim, data, onChange, onResize, coeffType }: VectorInputProps) => {
	const valueCsv = data.map((v) => v.trim() || "0").join(";");

	return (
		<Stack gap="sm">
			<Flex align="center" justify="between">
				<Flex align="center" gap="sm">
					<Markdown className="font-bold">{label}</Markdown>
					<Text>次元:</Text>
					<NumberInput
						min={1}
						max={20}
						value={dim}
						onChangeNumber={(val) => onResize(val || 1)}
						className="w-16"
						allowFloat={false}
					/>
				</Flex>

				<Flex align="center" gap="xs">
					<VariablePickerIconButton
						kind="linalg.vector"
						onPick={(e) => {
							try {
								const items = splitVectorLike(e.value);
								const nextDim = Math.max(1, items.length);
								onResize(nextDim);
								for (let i = 0; i < nextDim; i++) {
									onChange(i, items[i] ?? "0");
								}
							} catch (err) {
								console.error("Failed to load vector variable:", err);
							}
						}}
					/>
					<SaveVariableIconButton kind="linalg.vector" value={valueCsv} suggestedName={"v"} />
					<CopyIconButton text={valueCsv} />
				</Flex>
			</Flex>

			<View bg="muted" rounded="lg" padding="md" className="bg-opacity-30 overflow-x-auto">
				<Grid cols={1} gap="sm" className="w-max">
					{Array.from({ length: dim }, (_, i) => (
						<MatrixCell
							key={i}
							value={data[i] ?? "0"}
							onChange={(val) => onChange(i, val)}
							coeffType={coeffType}
						/>
					))}
				</Grid>
			</View>
		</Stack>
	);
};
