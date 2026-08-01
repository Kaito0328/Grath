"use client";
import { Stack } from "../../../../design/primitives/Stack";

import { useEffect, useState } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { SaveVariableModal } from "../../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../../stores/variableManager/types";

import { SymbolicExpr } from "@my-project/client-sdk/api/algebraicApi";
import { algebraicErrorToDisplayMessage } from "../../config/errorCodeMessages";
import { UnaryOperationLayout } from "../../../../shared/layouts/UnaryOperationLayout";
import { SimplifyOperationOutput } from "./SimplifyOperationOutput";
import { SymbolicExprInput } from "../../types/SymbolicExprInput";
import { Button } from "../../../../design/baseComponents/Button";
const kind: VariableKind = "algebraic.symbolicComplex";

type PendingSave = { value: string; latex?: string } | null;

export interface SimplifyOperationProps {
  startIndex?: number;
}

export const SimplifyOperation = ({ startIndex = 1 }: SimplifyOperationProps) => {
  const [input, setInput] = useState<SymbolicExpr | null>(null);

  useEffect(() => {
    SymbolicExpr.fromString("(1/2 + 1/3) * x").then(setInput);
  }, []);
  const [outputText, setOutputText] = useState<string | null>(null);
  const [outputLatex, setOutputLatex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingSave, setPendingSave] = useState<PendingSave>(null);

  async function onRun() {
    setBusy(true);
    setError(null);
    try {
      if (!input) return;
      const res = await input.simplify();
      setOutputText(res.toString());
      setOutputLatex(await res.toLatex());
    } catch (e) {
      setError(algebraicErrorToDisplayMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (!input) return null;

  return (
    <Stack gap={"lg"}>
      <UnaryOperationLayout
        startIndex={startIndex}
        input={
          <SymbolicExprInput
            label={
              <Stack direction="row" gap={"sm"}>
                <Text>E</Text>
              </Stack>
            }
            value={input}
            onChange={setInput}
            onRequestSave={(args) => setPendingSave(args)}
          />
        }
        action={
          <Stack gap={"sm"}>
            <Stack direction="row">
              <Button onClick={onRun} disabled={busy || input === null || input.toString().trim().length === 0} loading={busy}>
                簡約
              </Button>
            </Stack>
            {error && <Text className="text-red-500">{error}</Text>}
          </Stack>
        }
        output={
          <SimplifyOperationOutput
            value={outputText}
            latex={outputLatex}
            onRequestSave={(args) => setPendingSave(args)}
          />
        }
      />

      <SaveVariableModal
        open={pendingSave !== null}
        onClose={() => setPendingSave(null)}
        kind={kind}
        value={pendingSave?.value ?? ""}
        latex={pendingSave?.latex}
      />
    </Stack>
  );
};
