"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useState, type ReactNode } from "react";

import { IconButton } from "../../../design/baseComponents/IconButton";
import { Copy as CopyIcon } from 'lucide-react';
import { Save as SaveIcon } from 'lucide-react';
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { Divider } from "../../../design/baseComponents/Divider";
import { Text } from "../../../design/baseComponents/Text";

import { View } from "../../../design/primitives/View";
import { writeClipboardText } from "../../../shared/clipboard/writeText";
import { Rational } from "@my-project/client-sdk/api/algebraicApi";

import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";

export interface RationalInputProps {
  label?: ReactNode;
  value: Rational | null;
  onChange: (value: Rational) => void;
  onRequestSave: (args: { value: string; latex?: string }) => void;
  showActions?: boolean;
  frame?: boolean;
}

export const RationalInput = ({ label, value, onChange, onRequestSave, showActions = true, frame = true }: RationalInputProps) => {
  const [busy, setBusy] = useState(false);

  const canUse = !busy && value !== null && String(value.toDTO().denom) !== "0";

  async function onCopy() {
    if (!value) return;
    setBusy(true);
    try {
      const latex = await value.toLatex();
      await writeClipboardText(latex);
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    if (!value) return;
    setBusy(true);
    try {
      const latex = await value.toLatex();
      onRequestSave({ value: value.toString(), latex });
    } finally {
      setBusy(false);
    }
  }

  async function onPickVariable(valueText: string) {
    setBusy(true);
    try {
      const parsed = await Rational.fromString(valueText);
      onChange(parsed);
    } finally {
      setBusy(false);
    }
  }


  const headerEnabled = !!label || showActions;

  const content = (
    <Stack gap={"md"}>
      {headerEnabled && (
        <Stack direction="row" className="w-full justify-between items-center">
          {label ? (typeof label === "string" || typeof label === "number" ? <Text weight="semibold">{label}</Text> : label) : <View />}

          {showActions ? (
            <Stack direction="row" gap={"sm"}>
              <IconButton onClick={onCopy} disabled={!canUse}>
                <CopyIcon className="h-5 w-5" />
              </IconButton>
              <VariablePickerIconButton
                kind="algebraic.rational"
                label="呼び出し"
                disabled={busy}
                onPick={(entry) => onPickVariable(entry.value)}
              />
              <IconButton
                onClick={onSave}
                disabled={!canUse}
              >
                <SaveIcon className="h-5 w-5" />
              </IconButton>
            </Stack>
          ) : (
            <View />
          )}
        </Stack>
      )}

      <Stack gap={"sm"}>
        <NumberInput
          value={value ? Number(value.toDTO().numer) : Number.NaN}
          onChangeNumber={async (n) =>
            onChange(await Rational.create(n, value ? Number(value.toDTO().denom) : 1))
          }
          placeholder="分子"
          allowFloat={false}
        />
        <Divider />
        <NumberInput
          value={value ? Number(value.toDTO().denom) : Number.NaN}
          onChangeNumber={async (n) =>
            onChange(await Rational.tryNew(value ? Number(value.toDTO().numer) : 0, n).catch(() => value as Rational))
          }
          placeholder="分母"
          allowFloat={false}
        />
      </Stack>
    </Stack>
  );

  if (!frame) return content;
  return (
    <View bg="card" rounded="lg" padding={"lg"} className="border border-slate-300 dark:border-slate-700 shadow-sm">
      {content}
    </View>
  );
};
