"use client";
import { Stack } from "../../../../design/primitives/Stack";

import { useEffect, useMemo, useState } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { Markdown } from "../../../../design/baseComponents/Markdown";
import { SaveVariableModal } from "../../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../../stores/variableManager/types";

import { RationalInput } from "../../types/RationalInput";
import { RationalOutput } from "../../types/RationalOutput";
import { UnaryOperationLayout } from "../../../../shared/layouts/UnaryOperationLayout";

import { algebraicErrorToDisplayMessage } from "../../config/errorCodeMessages";

import { Rational } from "@my-project/client-sdk/api/algebraicApi";
import { Button } from "../../../../design/baseComponents/Button";
const kind: VariableKind = "algebraic.rational";

type PendingSave = { value: string; latex?: string } | null;

export interface RationalSimplifyOperationProps {
  startIndex?: number;
}

export const RationalSimplifyOperation = ({ startIndex = 1 }: RationalSimplifyOperationProps) => {
  const [input, setInput] = useState<Rational | null>(null);

  useEffect(() => {
    Rational.tryNew(10, 6).then(setInput);
  }, []);
  const [outputText, setOutputText] = useState<string | null>(null);
  const [outputLatex, setOutputLatex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingSave, setPendingSave] = useState<PendingSave>(null);

  const canRun = useMemo(
    () => input !== null && String(input.toDTO().denom) !== "0" && !busy,
    [input, busy]
  );

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
          <RationalInput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{"$r$"}</Markdown>
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
              <Button onClick={onRun} disabled={!canRun} loading={busy}>
                簡約
              </Button>
            </Stack>
            {error && <Text className="text-red-500">{error}</Text>}
          </Stack>
        }
        output={
          <RationalOutput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{"$\\mathrm{simp}(r)$"}</Markdown>
              </Stack>
            }
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
