"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useState, type ReactNode } from "react";

import { IconButton } from "../../../design/baseComponents/IconButton";
import { Copy as CopyIcon } from 'lucide-react';
import { Save as SaveIcon } from 'lucide-react';
import { Text } from "../../../design/baseComponents/Text";

import { Input } from "../../../design/baseComponents/Input";

import { View } from "../../../design/primitives/View";
import { writeClipboardText } from "../../../shared/clipboard/writeText";
import { SymbolicExpr } from "@my-project/client-sdk/api/algebraicApi";

import { VariablePickerIconButton } from "../../../shared/variable-manager/VariablePickerIconButton";

export interface SymbolicExprInputProps {
  label?: ReactNode;
  value: SymbolicExpr;
  onChange: (value: SymbolicExpr) => void;
  onRequestSave: (args: { value: string; latex?: string }) => void;
  showActions?: boolean;
  frame?: boolean;
}

export const SymbolicExprInput = ({
  label,
  value,
  onChange,
  onRequestSave,
  showActions = true,
  frame = true,
}: SymbolicExprInputProps) => {
  const [busy, setBusy] = useState(false);

  const canUse = !busy && value.toString().trim().length > 0;

  async function onCopy() {
    setBusy(true);
    try {
      const latex = await value.toLatex();
      await writeClipboardText(latex);
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
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
      const parsed = await SymbolicExpr.fromString(valueText);
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
                kind="algebraic.symbolicComplex"
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

      <Input
        value={value.toString()}
        onChange={async (e) => onChange(await SymbolicExpr.fromString(e.target.value).catch(() => value))}
        placeholder="(1/2 + 1/3) * x"
      />
    </Stack>
  );

  if (!frame) return content;
  return (
    <View bg="card" rounded="lg" padding={"lg"} className="border border-slate-300 dark:border-slate-700 shadow-sm">
      {content}
    </View>
  );
};
