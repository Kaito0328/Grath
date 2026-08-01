"use client";
import { Stack } from "../../../../design/primitives/Stack";

import { useEffect, useMemo, useState } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { Markdown } from "../../../../design/baseComponents/Markdown";
import { SaveVariableModal } from "../../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../../stores/variableManager/types";

import { SymbolicComplexInput } from "../../types/SymbolicComplexInput";
import { SymbolicComplexOutput } from "../../types/SymbolicComplexOutput";
import { BinaryOperationLayout } from "../../layouts/BinaryOperationLayout";

import { algebraicErrorToDisplayMessage } from "../../config/errorCodeMessages";

import { SymbolicComplex } from "@my-project/client-sdk/api/algebraicApi";
import { Button } from "../../../../design/baseComponents/Button";
const kind: VariableKind = "algebraic.symbolicComplex";

type PendingSave = { value: string; latex?: string } | null;

export interface ComplexBinaryOperationProps {
  op: "add" | "sub" | "mul";
  startIndex?: number;
}

export const ComplexBinaryOperation = ({ op, startIndex = 1 }: ComplexBinaryOperationProps) => {
  const [left, setLeft] = useState<SymbolicComplex | null>(null);
  const [right, setRight] = useState<SymbolicComplex | null>(null);

  useEffect(() => {
    SymbolicComplex.fromString("1 + i").then(setLeft);
    SymbolicComplex.fromString("1 - i").then(setRight);
  }, []);

  const [outputText, setOutputText] = useState<string | null>(null);
  const [outputLatex, setOutputLatex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingSave, setPendingSave] = useState<PendingSave>(null);

  const canRun = useMemo(
    () => left !== null && right !== null && left.toString().trim().length > 0 && right.toString().trim().length > 0 && !busy,
    [left, right, busy]
  );

  async function onRun() {
    setBusy(true);
    setError(null);

    try {
      if (!left || !right) return;
      let res: SymbolicComplex;
      switch (op) {
        case "add": res = await left.add(right); break;
        case "sub": res = await left.sub(right); break;
        case "mul": res = await left.mul(right); break;
      }

      setOutputText(res.toString());
      setOutputLatex(await res.toLatex());
    } catch (e) {
      setError(algebraicErrorToDisplayMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const title = op === "add" ? "加算" : op === "sub" ? "減算" : "乗算";
  const outputLabel = op === "add" ? "$E_1 + E_2$" : op === "sub" ? "$E_1 - E_2$" : "$E_1 \\cdot E_2$";

  if (!left || !right) return null;

  return (
    <Stack gap={"lg"}>
      <BinaryOperationLayout
        startIndex={startIndex}
        left={
          <SymbolicComplexInput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{"$E_1$"}</Markdown>
              </Stack>
            }
            value={left}
            onChange={setLeft}
            onRequestSave={(args) => setPendingSave(args)}
          />
        }
        right={
          <SymbolicComplexInput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{"$E_2$"}</Markdown>
              </Stack>
            }
            value={right}
            onChange={setRight}
            onRequestSave={(args) => setPendingSave(args)}
          />
        }
        action={
          <Stack gap={"sm"}>
            <Stack direction="row" className="justify-center">
              <Button onClick={onRun} disabled={!canRun} loading={busy}>
                {title}
              </Button>
            </Stack>
            {error && <Text className="text-red-500">{error}</Text>}
          </Stack>
        }
        output={
          <SymbolicComplexOutput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{outputLabel}</Markdown>
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
