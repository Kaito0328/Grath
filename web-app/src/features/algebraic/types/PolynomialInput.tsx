import { ReactNode } from "react";
import { Stack } from "../../../design/primitives/Stack";
import { Flex } from "../../../design/primitives/Flex";
import { Input } from "../../../design/baseComponents/Input";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Button } from "../../../design/baseComponents/Button";
import { PlusIcon, MinusIcon } from "lucide-react";
import { View } from "../../../design/primitives/View";
import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../../shared/variable-manager/SaveVariableIconButton";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";
import type { VariableKind } from "../../../stores/variableManager/types";

interface PolynomialInputProps {
    coeffs: string[];
    onChange: (coeffs: string[]) => void;
    placeholder?: string;
    label?: ReactNode;
    coeffType?: "numeric" | "rational" | "symbolic";
    variable?: string;
	kind?: VariableKind;
	suggestedName?: string;
}

export const PolynomialInput = ({ coeffs, onChange, placeholder, label, coeffType = "numeric", variable = "x", kind, suggestedName }: PolynomialInputProps) => {

    // Ensure at least one coefficient exists
    const safeCoeffs = coeffs.length > 0 ? coeffs : [""];

    const handleChange = (index: number, val: string) => {
        const newCoeffs = [...safeCoeffs];
        newCoeffs[index] = val;
        onChange(newCoeffs);
    };

    const addTerm = () => {
        onChange([...safeCoeffs, ""]);
    };

    const removeTerm = () => {
        if (safeCoeffs.length > 1) {
            const newCoeffs = [...safeCoeffs];
            newCoeffs.pop();
            onChange(newCoeffs);
        }
    };

    const toCsv = (arr: string[]) => arr.map((s) => s.trim() || "0").join(",");
    const fromCsvLike = (raw: string) => {
        const parts = (raw ?? "")
            .split(/[;,\n]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        return parts.length > 0 ? parts : ["0"];
    };

    return (
        <Stack gap="sm">
            {(label || kind) && (
				<Flex align="center" justify="between" gap="sm" wrap={true}>
					{label ? (
						<Text weight="semibold" className="mb-1">{label}</Text>
					) : (
                        <View />
					)}
					{kind && (
						<Flex align="center" gap="xs">
							<VariablePickerIconButton
								kind={kind}
								onPick={(e) => onChange(fromCsvLike(e.value))}
							/>
							<SaveVariableIconButton
								kind={kind}
								value={toCsv(safeCoeffs)}
								suggestedName={suggestedName ?? (typeof label === "string" ? label : "Polynomial")}
								disabled={safeCoeffs.every((c) => (c ?? "").trim().length === 0)}
							/>
							<CopyIconButton text={toCsv(safeCoeffs)} />
						</Flex>
					)}
				</Flex>
			)}
            <View bg="card" rounded="lg" padding="md" className="border border-slate-300 dark:border-slate-700 shadow-sm">
                <Flex gap="sm" wrap={true} align="center">
                    {safeCoeffs.map((c, i) => {
                        const mathString = i === 0 ? "" : i === 1 ? ` ${variable}` : ` ${variable}^${i}`;
                        return (
                            <Flex key={i} align="center" gap="xs">
                                {i > 0 && <Text weight="bold" variant="h3" className="mx-1 text-slate-700 dark:text-slate-300">+</Text>}
                                {coeffType === "rational" ? (
                                    <View bg="muted" className="dark:bg-slate-900 border border-input rounded-md p-1 shadow-sm">
                                        <Stack align="center" gap="none">
                                            <Input
                                                value={c.split("/")[0] || ""}
                                                onChange={(e) => handleChange(i, `${e.target.value}/${c.split("/")[1] || '1'}`)}
                                                placeholder="分子"
                                                className="w-16 text-center text-sm h-8"
                                            />
                                            <View className="w-12 h-px bg-slate-300 dark:bg-slate-600" />
                                            <Input
                                                value={c.split("/")[1] || ""}
                                                onChange={(e) => handleChange(i, `${c.split("/")[0] || '0'}/${e.target.value}`)}
                                                placeholder="分母"
                                                className="w-16 text-center text-sm h-8"
                                            />
                                        </Stack>
                                    </View>
                                ) : (
                                    <Input
                                        value={c}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        className="w-24 text-center"
                                        placeholder={placeholder ?? "0"}
                                    />
                                )}
                                {i > 0 && (
                                    <View className="text-xl font-medium text-foreground">
                                        <Markdown>{`$${mathString}$`}</Markdown>
                                    </View>
                                )}
                            </Flex>
                        );
                    })}
                    <Flex align="center" gap="sm" className="ml-4 border-l pl-4 border-border">
                        <Button variant="outline" size="icon" onClick={addTerm} className="w-8 h-8 rounded-full">
                            <PlusIcon size={16} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={removeTerm} disabled={safeCoeffs.length <= 1} className="w-8 h-8 rounded-full">
                            <MinusIcon size={16} />
                        </Button>
                    </Flex>
                </Flex>
            </View>
        </Stack>
    );
};
