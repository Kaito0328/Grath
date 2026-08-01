"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useEffect, useMemo, useState } from "react";
import { Input } from "../../../design/baseComponents/Input";
import { Modal } from "../../../design/baseComponents/Modal";
import { Text } from "../../../design/baseComponents/Text";
import { useVariableManagerStore } from "../../../stores/variableManager/store";
import type { VariableKind } from "../../../stores/variableManager/types";
import { Button } from "../../../design/baseComponents/Button";

export interface SaveVariableModalProps {
  open: boolean;
  onClose: () => void;
  kind: VariableKind;
  defaultName?: string;
  value: string;
  latex?: string;
}

export const SaveVariableModal = ({
  open,
  onClose,
  kind,
  defaultName,
  value,
  latex,
}: SaveVariableModalProps) => {
  const save = useVariableManagerStore((s) => s.save);
  const [name, setName] = useState("");

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  useEffect(() => {
    if (!open) return;
    setName(defaultName ?? "");
  }, [open, defaultName]);

  function onSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;

    save({
      kind,
      name: trimmed,
      value,
      latex,
    });

    onClose();
  }

  return (
    <Modal open={open} title="変数として保存" onClose={onClose}>
      <Stack gap={"md"}>
        <Text variant="xs" color="muted" className="text-right">
          型: {kind}
        </Text>

        <Stack gap={"sm"}>
          <Text color={"muted"}>名前</Text>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: expr1"
            autoFocus
          />
        </Stack>

        <Stack direction="row" gap={"sm"}>
          <Button color="secondary" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={onSubmit} disabled={!canSave}>
            保存
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
