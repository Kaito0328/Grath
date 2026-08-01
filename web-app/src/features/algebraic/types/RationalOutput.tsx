"use client";
import { Stack } from "../../../design/primitives/Stack";

import type { ReactNode } from "react";

import { IconButton } from "../../../design/baseComponents/IconButton";
import { Copy as CopyIcon } from 'lucide-react';
import { Save as SaveIcon } from 'lucide-react';
import { Markdown } from "../../../design/baseComponents/Markdown";
import { Text } from "../../../design/baseComponents/Text";

import { View } from "../../../design/primitives/View";
import { writeClipboardText } from "../../../shared/clipboard/writeText";

export interface RationalOutputProps {
  label?: ReactNode;
  value: string | null;
  latex: string | null;
  onRequestSave?: (args: { value: string; latex?: string }) => void;
  showActions?: boolean;
  frame?: boolean;
  emptyText?: ReactNode;
}

export const RationalOutput = ({
  label,
  value,
  latex,
  onRequestSave,
  showActions = true,
  frame = true,
  emptyText,
}: RationalOutputProps) => {
  async function onCopy() {
    if (!latex) return;
    await writeClipboardText(latex);
  }

  function onSave() {
    if (!value) return;
    onRequestSave?.({ value: value.trim(), latex: latex ?? undefined });
  }

  const actionsEnabled = showActions;
  const canSave = !!value && !!onRequestSave;

  const content = (
    <Stack gap={"md"}>
      {(label || actionsEnabled) && (
        <Stack direction="row" className="w-full justify-between items-center">
          {label ? (
            typeof label === "string" || typeof label === "number" ? (
              <Text>{label}</Text>
            ) : (
              label
            )
          ) : (
            <View />
          )}

          {actionsEnabled ? (
            <Stack direction="row" gap={"sm"}>
              <IconButton onClick={onCopy} disabled={!latex}>
                <CopyIcon className="h-5 w-5" />
              </IconButton>
              {canSave && (
                <IconButton onClick={onSave} disabled={!value}>
                  <SaveIcon className="h-5 w-5" />
                </IconButton>
              )}
            </Stack>
          ) : (
            <View />
          )}
        </Stack>
      )}

      {latex ? <View className="text-2xl overflow-x-auto py-2"><Markdown>{`$$${latex}$$`}</Markdown></View> : <Text color={"muted"}>{emptyText ?? "まだ実行されていません。"}</Text>}
    </Stack>
  );

  if (!frame) return content;
  return (
    <View bg="card" rounded="lg" padding={"lg"} className="border border-slate-300 dark:border-slate-700 shadow-sm">
      {content}
    </View>
  );
};
