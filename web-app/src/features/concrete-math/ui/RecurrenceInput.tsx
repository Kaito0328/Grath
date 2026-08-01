import { ReactNode } from "react";
import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Input } from "../../../design/baseComponents/Input";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Button } from "../../../design/baseComponents/Button";
import { PlusIcon, MinusIcon, HelpCircle } from "lucide-react";
import { View } from "../../../design/primitives/View";
import { PolynomialInput } from "../../algebraic/types/PolynomialInput";
import { IconButton } from "../../../design/baseComponents/IconButton";
import { Copy as CopyIcon, Save as SaveIcon } from 'lucide-react';
import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";
import { writeClipboardText } from "../../../shared/clipboard/writeText";

export type CoeffType = "numeric" | "rational" | "symbolic";

export interface NonHomogeneousTerm {
    poly: string[];
    base: string;
}

interface RecurrenceInputProps {
    coeffs: string[];
    onCoeffsChange: (coeffs: string[]) => void;
    initials: string[];
    onInitialsChange: (initials: string[]) => void;
    coeffType?: CoeffType;
    label?: ReactNode;
    onRequestSave?: (args: { value: string; latex?: string }) => void;
    onPickVariable?: (value: string) => void;
    showActions?: boolean;
}

export const RecurrenceInput = ({
    coeffs,
    onCoeffsChange,
    initials,
    onInitialsChange,
    coeffType = "numeric",
    label,
    onRequestSave,
    onPickVariable,
    showActions = true,
}: RecurrenceInputProps) => {

    const handleCoeffChange = (index: number, val: string) => {
        const newCoeffs = [...coeffs];
        newCoeffs[index] = val;
        onCoeffsChange(newCoeffs);
    };

    const handleInitialChange = (index: number, val: string) => {
        const newInitials = [...initials];
        newInitials[index] = val;
        onInitialsChange(newInitials);
    };

    const addOrder = () => {
        onCoeffsChange([...coeffs, "0"]);
        onInitialsChange([...initials, "0"]);
    };

    const removeOrder = () => {
        if (coeffs.length > 1) {
            onCoeffsChange(coeffs.slice(0, -1));
            onInitialsChange(initials.slice(0, -1));
        }
    };

    const serialize = () => {
        return JSON.stringify({ coeffs, initials });
    };

    const onCopy = async () => {
        await writeClipboardText(serialize());
    };

    const onSave = () => {
        onRequestSave?.({ value: serialize() });
    };

    const renderCoeffInput = (value: string, onChange: (val: string) => void, placeholder = "0", width = "w-16") => {
        if (coeffType === "rational") {
            return (
                <View bg="muted" className="dark:bg-slate-900 border border-input rounded-md p-1 shadow-sm">
                    <Stack align="center" gap="none">
                        <Input
                            value={value.split("/")[0] || ""}
                            onChange={(e) => onChange(`${e.target.value}/${value.split("/")[1] || '1'}`)}
                            placeholder="分子"
                            className={`${width} text-center text-xs h-8`}
                        />
                        <View className="w-full h-px bg-slate-300 dark:bg-slate-600" />
                        <Input
                            value={value.split("/")[1] || ""}
                            onChange={(e) => onChange(`${value.split("/")[0] || '0'}/${e.target.value}`)}
                            placeholder="分母"
                            className={`${width} text-center text-xs h-8`}
                        />
                    </Stack>
                </View>
            );
        }
        return (
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${width} text-center text-sm h-8`}
                placeholder={placeholder}
            />
        );
    };

    return (
        <Stack gap="md">
            <Flex justify="between" align="center">
                {label ? (
                    typeof label === "string" || typeof label === "number" ? (
                        <Text weight="semibold" variant="h4">{label}</Text>
                    ) : (
                        label
                    )
                ) : (
                    <View />
                )}
                {showActions && (
                    <Flex gap="sm" align="center">
                        <IconButton onClick={onCopy} title="コピー">
                            <CopyIcon size={18} />
                        </IconButton>
                        <VariablePickerIconButton
                            kind="algebraic.symbolicComplex"
                            label="呼び出し"
                            onPick={(entry) => onPickVariable?.(entry.value)}
                        />
                        <IconButton onClick={onSave} disabled={!onRequestSave} title="保存">
                            <SaveIcon size={18} />
                        </IconButton>
                    </Flex>
                )}
            </Flex>

            <View bg="card" rounded="lg" padding="lg" className="border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
                <View className="absolute top-0 right-0 p-2 text-slate-300 dark:text-slate-700">
                    <HelpCircle size={16} />
                </View>

                <Stack gap="lg">
                    {/* Equation Visualization */}
                    <Stack gap="xs">
                        <Text weight="semibold" color="primary" variant="detail" className="uppercase tracking-wider text-[10px]">漸化式の定義</Text>
                        <Flex gap="sm" wrap={true} align="center" className="min-h-[40px]">
                            <Text weight="bold" variant="h3" className="mr-1">aₙ =</Text>
                            {coeffs.map((c, i) => (
                                <Flex key={i} align="center" gap="xs">
                                    {renderCoeffInput(c, (val) => handleCoeffChange(i, val))}
                                    <Markdown className="text-base font-medium text-slate-800 dark:text-slate-200 overflow-visible">{`$a_{n-${i + 1}}$`}</Markdown>
                                    {i < coeffs.length - 1 && <Text weight="light" className="text-slate-400 mx-1 text-base">+</Text>}
                                </Flex>
                            ))}

                            <Flex align="center" gap="xs" className="ml-2 border-l pl-2 border-slate-200 dark:border-slate-800">
                                <Button variant="outline" size="icon" onClick={addOrder} className="w-6 h-6 rounded-full">
                                    <PlusIcon size={12} />
                                </Button>
                                <Button variant="outline" size="icon" onClick={removeOrder} disabled={coeffs.length <= 1} className="w-6 h-6 rounded-full">
                                    <MinusIcon size={12} />
                                </Button>
                            </Flex>
                        </Flex>
                    </Stack>

                    {/* Initial Values */}
                    <Stack gap="xs" className="pt-2 border-t border-slate-100 dark:border-slate-900">
                        <Text weight="semibold" color="primary" variant="detail" className="uppercase tracking-wider text-[10px]">初期値</Text>
                        <Flex gap="sm" wrap={true} align="center">
                            {initials.map((v, i) => (
                                <Flex key={i} align="center" gap="xs" className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                                    <Markdown className="text-sm font-medium text-slate-700 dark:text-slate-300 overflow-visible">{`$a_{${i}} = $`}</Markdown>
                                    {renderCoeffInput(v, (val) => handleInitialChange(i, val), "0", "w-16")}
                                </Flex>
                            ))}
                        </Flex>
                    </Stack>
                </Stack>
            </View>
        </Stack>
    );
};
