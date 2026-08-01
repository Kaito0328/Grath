"use client";
import React, { useState } from "react";
import { IconButton, type IconButtonProps } from "../../design/baseComponents/IconButton";
import { Save } from "lucide-react";
import { useVariableManagerStore } from "../../stores/variableManager/store";
import { type VariableKind } from "../../stores/variableManager/types";
import { Modal } from "../../design/baseComponents/Modal";
import { Stack } from "../../design/primitives/Stack";
import { Text } from "../../design/baseComponents/Text";
import { Input } from "../../design/baseComponents/Input";
import { Button } from "../../design/baseComponents/Button";

export interface SaveVariableIconButtonProps extends Omit<IconButtonProps, "onClick" | "children" | "icon"> {
    kind: VariableKind;
    value: string;
    latex?: string;
    suggestedName?: string;
}

export const SaveVariableIconButton = ({ kind, value, latex, suggestedName = "", className, ...props }: SaveVariableIconButtonProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(suggestedName);
    const save = useVariableManagerStore(s => s.save);

    const handleSave = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        save({ kind, name: trimmed, value, latex });
        setOpen(false);
    };

    return (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                className={className}
                title={`変数として保存 (${kind})`}
                {...props}
            >
                <Save className="h-4 w-4" />
            </IconButton>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="変数として保存"
                size="sm"
                footer={
                    <Stack direction="row" gap="sm" className="justify-end w-full">
                        <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSave} disabled={!name.trim()}>保存</Button>
                    </Stack>
                }
            >
                <Stack gap="sm">
                    <Text variant="xs" color="muted" className="text-right">
                        型: {kind}
                    </Text>
                    <Text variant="detail">変数名を入力してください</Text>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="例: MatrixA"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleSave()}
                    />
                </Stack>
            </Modal>
        </>
    );
};
