"use client";
import { Stack } from "../../../../design/primitives/Stack";

import { useEffect, useMemo, useState } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { Markdown } from "../../../../design/baseComponents/Markdown";
import { SaveVariableModal } from "../../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../../stores/variableManager/types";

import { SymbolicExprInput } from "../../types/SymbolicExprInput";
import { SymbolicExprOutput } from "../../types/SymbolicExprOutput";
import { BinaryOperationLayout } from "../../layouts/BinaryOperationLayout";

import { SymbolicExpr } from "@my-project/client-sdk/api/algebraicApi";
import { algebraicErrorToDisplayMessage } from "../../config/errorCodeMessages";
import { Button } from "../../../../design/baseComponents/Button";
const kind: VariableKind = "algebraic.symbolicComplex";

type PendingSave = { value: string; latex?: string } | null;

export interface ExprBinaryOperationProps {
  op: "add" | "mul";
  startIndex?: number;
}

export const ExprBinaryOperation = ({ op, startIndex = 1 }: ExprBinaryOperationProps) => {
  const [left, setLeft] = useState<SymbolicExpr | null>(null);
  const [right, setRight] = useState<SymbolicExpr | null>(null);

  useEffect(() => {
    SymbolicExpr.fromString("x").then(setLeft);
    SymbolicExpr.fromString("1/2").then(setRight);
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
      let res: SymbolicExpr;
      switch (op) {
        case "add": res = await SymbolicExpr.add([left, right]); break;
        case "mul": res = await SymbolicExpr.mul([left, right]); break;
      }

      const simplified = await res.simplify();
      setOutputText(simplified.toString());
      setOutputLatex(await simplified.toLatex());
    } catch (e) {
      setError(algebraicErrorToDisplayMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const title = op === "add" ? "加算" : "乗算";
  const outputLabel = op === "add" ? "$E_1 + E_2$" : "$E_1 \\cdot E_2$";

  if (!left || !right) return null;

  return (
    <Stack gap={"lg"}>
      <BinaryOperationLayout
        startIndex={startIndex}
        left={
          <SymbolicExprInput
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
          <SymbolicExprInput
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
          <SymbolicExprOutput
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
