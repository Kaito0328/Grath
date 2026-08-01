"use client";
import { Stack } from "../../../../design/primitives/Stack";

import { useMemo } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { SymbolicExprInput } from "../../types/SymbolicExprInput";
import type { SymbolicExpr } from "@my-project/client-sdk/api/algebraicApi";
import { Button } from "../../../../design/baseComponents/Button";

export interface SimplifyOperationInputProps {
  value: SymbolicExpr;
  onChange: (value: SymbolicExpr) => void;
  busy: boolean;
  error: string | null;
  onRun: () => void;
  onRequestSave: (args: { value: string; latex?: string }) => void;
}

export const SimplifyOperationInput = ({
  value,
  onChange,
  busy,
  error,
  onRun,
  onRequestSave,
}: SimplifyOperationInputProps) => {
  const canRun = useMemo(() => value.toString().trim().length > 0 && !busy, [value, busy]);

  return (
    <Stack gap={"sm"}>
      <SymbolicExprInput
        label="A"
        value={value}
        onChange={onChange}
        onRequestSave={onRequestSave}
      />

      <Stack direction="row">
        <Button onClick={onRun} disabled={!canRun} loading={busy}>
          Simplify
        </Button>
      </Stack>

      {error && <Text className="text-red-500">{error}</Text>}
    </Stack>
  );
};
