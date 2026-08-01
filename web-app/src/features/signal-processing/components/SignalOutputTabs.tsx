"use client";

import { FormField } from "../../../design/baseComponents/FormField";
import { Tabs } from "../../../design/baseComponents/Tabs";
import { Text } from "../../../design/baseComponents/Text";
import { TextArea } from "../../../design/baseComponents/TextArea";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { DiscreteSignalPlot } from "./DiscreteSignalPlot";

export interface SignalOutputTabsProps {
    label: string;
    kind: string;
    csvText: string;
    signalValues: number[];
    dftValues?: number[];
    suggestedSaveName?: string;
    showActions?: boolean;
    csvPlaceholder?: string;
}

export function SignalOutputTabs({
    label,
    kind,
    csvText,
    signalValues,
    dftValues,
    suggestedSaveName,
    showActions = true,
    csvPlaceholder = "ここに結果が表示されます",
}: SignalOutputTabsProps) {
    const hasSignal = signalValues.length > 0;
    const hasDft = Array.isArray(dftValues) && dftValues.length > 0;

    return (
        <FormField label={label}>
            <Stack gap="sm">
                {showActions ? (
                    <Stack direction="row" gap="sm" className="justify-end">
                        <SaveVariableIconButton kind={kind} value={csvText} suggestedName={suggestedSaveName} />
                        <CopyIconButton text={csvText} disabled={csvText.trim().length === 0} />
                    </Stack>
                ) : null}

                <Tabs
                    variant="line"
                    defaultTab="graph"
                    items={[
                        {
                            id: "csv",
                            label: "CSV",
                            content: <TextArea value={csvText} readOnly rows={6} placeholder={csvPlaceholder} />,
                        },
                        {
                            id: "graph",
                            label: "グラフ",
                            content: (
                                <View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
                                    {hasSignal ? <DiscreteSignalPlot values={signalValues} /> : <Text color="muted">表示するデータがありません。</Text>}
                                </View>
                            ),
                        },
                        {
                            id: "dft",
                            label: "DFTグラフ",
                            content: (
                                <View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
                                    {hasDft ? <DiscreteSignalPlot values={dftValues ?? []} /> : <Text color="muted">実行後に DFT 結果を表示します。</Text>}
                                </View>
                            ),
                        },
                    ]}
                />
            </Stack>
        </FormField>
    );
}
