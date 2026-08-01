import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Grid } from "../../../design/primitives/Grid";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";
import { View } from "../../../design/primitives/View";
import { MatrixCell } from "./MatrixCell";

import { LinalgCoeffType } from "../LinalgOperations";

type MatrixInputProps = {
    label: string;
    rows: number;
    cols: number;
    data: string[][];
    onChange: (r: number, c: number, v: string) => void;
    onResize: (r: number, c: number) => void;
    coeffType: LinalgCoeffType;
};

export const MatrixInput = ({
    label,
    rows,
    cols,
    data,
    onChange,
    onResize,
    coeffType,
}: MatrixInputProps) => {
    return (
        <Stack gap="sm">
            <Flex align="center" justify="between">
                <Flex align="center" gap="sm">
                    <Markdown className="font-bold">{label}</Markdown>
                    <Text>行:</Text>
                    <NumberInput
                        min={1}
                        max={10}
                        value={rows}
                        onChangeNumber={(val) => onResize(val || 1, cols)}
                        className="w-16"
                        allowFloat={false}
                    />
                    <Text>列:</Text>
                    <NumberInput
                        min={1}
                        max={10}
                        value={cols}
                        onChangeNumber={(val) => onResize(rows, val || 1)}
                        className="w-16"
                        allowFloat={false}
                    />
                </Flex>

                <Flex align="center" gap="xs">
                    <VariablePickerIconButton
                        kind="linalg.matrix"
                        onPick={(e) => {
                            try {
                                const rows_data = e.value.split(";").map(r => r.split(","));
                                const r = rows_data.length;
                                const c = rows_data[0]?.length || 0;
                                onResize(r, c);
                                rows_data.forEach((row, i) => {
                                    row.forEach((v, j) => {
                                        onChange(i, j, v);
                                    });
                                });
                            } catch (err) {
                                console.error("Failed to load matrix variable:", err);
                            }
                        }}
                    />
                    <SaveVariableIconButton
                        kind="linalg.matrix"
                        value={data.map(row => row.join(",")).join(";")}
                        suggestedName={typeof label === 'string' ? label.replace(/\s+/g, '') : "Matrix"}
                    />
                    <CopyIconButton
                        text={data.map(row => row.join(",")).join(";")}
                    />
                </Flex>
            </Flex>

            <View bg="muted" rounded="lg" padding="md" className="bg-opacity-30 overflow-x-auto">
                <Grid
                    cols={cols}
                    gap="sm"
                    className="w-max"
                >
                    {data.map((row, rIdx) =>
                        row.map((cell, cIdx) => (
                            <MatrixCell
                                key={`${rIdx}-${cIdx}`}
                                value={cell}
                                onChange={(val) => onChange(rIdx, cIdx, val)}
                                coeffType={coeffType}
                            />
                        ))
                    )}
                </Grid>
            </View>
        </Stack>
    );
};
