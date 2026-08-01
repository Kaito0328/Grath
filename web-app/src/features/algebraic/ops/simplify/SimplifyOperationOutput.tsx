"use client";
import { Stack } from "../../../../design/primitives/Stack";
import { Text } from "../../../../design/baseComponents/Text";
import { SymbolicExprOutput } from "../../types/SymbolicExprOutput";

export interface SimplifyOperationOutputProps {
  value: string | null;
  latex: string | null;
  onRequestSave: (args: { value: string; latex?: string }) => void;
}

export const SimplifyOperationOutput = ({
  value,
  latex,
  onRequestSave,
}: SimplifyOperationOutputProps) => {
  return (
    <SymbolicExprOutput
      label={
        <Stack direction="row" gap={"sm"}>
          <Text>simp(E)</Text>
        </Stack>
      }
      value={value}
      latex={latex}
      onRequestSave={onRequestSave}
    />
  );
};
