"use client";
import { Stack } from "../../../../design/primitives/Stack";

import { useEffect, useMemo, useState } from "react";
import { Text } from "../../../../design/baseComponents/Text";
import { Markdown } from "../../../../design/baseComponents/Markdown";
import { SaveVariableModal } from "../../../variable-manager/ui/SaveVariableModal";
import type { VariableKind } from "../../../../stores/variableManager/types";

import { RationalInput } from "../../types/RationalInput";
import { RationalOutput } from "../../types/RationalOutput";
import { BinaryOperationLayout } from "../../layouts/BinaryOperationLayout";

import { algebraicErrorToDisplayMessage } from "../../config/errorCodeMessages";

import { Rational } from "@my-project/client-sdk/api/algebraicApi";
import { Button } from "../../../../design/baseComponents/Button";
const kind: VariableKind = "algebraic.rational";

type PendingSave = { value: string; latex?: string } | null;

export interface RationalBinaryOperationProps {
  op: "add" | "mul" | "div";
  startIndex?: number;
}

export const RationalBinaryOperation = ({ op, startIndex = 1 }: RationalBinaryOperationProps) => {
  const [left, setLeft] = useState<Rational | null>(null);
  const [right, setRight] = useState<Rational | null>(null);

  useEffect(() => {
    Rational.tryNew(1, 2).then(setLeft);
    Rational.tryNew(1, 3).then(setRight);
  }, []);

  const [outputText, setOutputText] = useState<string | null>(null);
  const [outputLatex, setOutputLatex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingSave, setPendingSave] = useState<PendingSave>(null);

  const canRun = useMemo(
    () => left !== null && right !== null && String(left.toDTO().denom) !== "0" && String(right.toDTO().denom) !== "0" && !busy,
    [left, right, busy]
  );

  async function onRun() {
    setBusy(true);
    setError(null);

    try {
      if (!left || !right) return;
      let res: Rational;
      switch (op) {
        case "add": res = await left.checkedAdd(right); break;
        case "mul": res = await left.checkedMul(right); break;
        case "div": res = await left.checkedDiv(right); break;
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

  const title = op === "add" ? "加算" : op === "mul" ? "乗算" : "除算";
  const outputLabel = op === "add" ? "$r_1 + r_2$" : op === "mul" ? "$r_1 \\cdot r_2$" : "$r_1 / r_2$";

  if (!left || !right) return null;

  return (
    <Stack gap={"lg"}>
      <BinaryOperationLayout
        startIndex={startIndex}
        left={
          <RationalInput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{"$r_1$"}</Markdown>
              </Stack>
            }
            value={left}
            onChange={setLeft}
            onRequestSave={(args) => setPendingSave(args)}
          />
        }
        right={
          <RationalInput
            label={
              <Stack direction="row" gap={"sm"}>
                <Markdown>{"$r_2$"}</Markdown>
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
          <RationalOutput
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
