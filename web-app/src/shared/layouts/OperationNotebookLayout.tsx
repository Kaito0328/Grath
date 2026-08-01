import { ReactNode } from "react";
import { Text } from "../../design/baseComponents/Text";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";

export interface OperationNotebookLayoutProps {
    setting?: ReactNode;
    input?: ReactNode;
    action?: ReactNode;
    output?: ReactNode;
    verification?: ReactNode;
    startIndex?: number;
}

interface OperationSectionProps {
    index: number;
    title: string;
    children: ReactNode;
}

function OperationSection({ index, title, children }: OperationSectionProps) {
    return (
        <Stack gap="sm" className="w-full">
            <View className="w-full border-b border-slate-300 dark:border-slate-700 pb-2">
                <Stack direction="row" gap="sm" className="items-center">
                    <Text variant="detail" weight="semibold" className="tracking-wide">
                        <Text span color="primary" weight="bold" className="mr-1">
                            {index}.
                        </Text>
                        {title}
                    </Text>
                </Stack>
            </View>
            <View className="px-1 py-1 sm:px-2">{children}</View>
        </Stack>
    );
}

export const OperationNotebookLayout = ({
    setting,
    input,
    action,
    output,
    verification,
    startIndex = 1,
}: OperationNotebookLayoutProps) => {
    const sections: Array<{ title: string; content: ReactNode }> = [];
    if (setting) sections.push({ title: "設定", content: setting });
    if (input) sections.push({ title: "入力", content: input });
    if (action) sections.push({ title: "実行", content: action });
    if (output) sections.push({ title: "結果", content: output });
    if (verification) sections.push({ title: "検証", content: verification });

    return (
        <Stack gap="lg">
            {sections.map((section, idx) => (
                <OperationSection key={section.title} index={startIndex + idx} title={section.title}>
                    {section.content}
                </OperationSection>
            ))}
        </Stack>
    );
};