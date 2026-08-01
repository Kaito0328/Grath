import { ReactNode } from "react";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { OperationNotebookLayout } from "../../../shared/layouts/OperationNotebookLayout";

export interface BinaryOperationLayoutProps {
  left: ReactNode;
  right: ReactNode;
  action?: ReactNode;
  output: ReactNode;
  verification?: ReactNode;
  startIndex?: number;
}

export const BinaryOperationLayout = ({
  left,
  right,
  action,
  output,
  verification,
  startIndex = 1,
}: BinaryOperationLayoutProps) => {
  const input = (
    <Stack direction="row" gap="lg" className="flex-wrap">
      <View className="flex-1 min-w-[280px]">{left}</View>
      <View className="flex-1 min-w-[280px]">{right}</View>
    </Stack>
  );

  return (
    <OperationNotebookLayout
      input={input}
      action={action}
      output={output}
      verification={verification}
      startIndex={startIndex}
    />
  );
};
