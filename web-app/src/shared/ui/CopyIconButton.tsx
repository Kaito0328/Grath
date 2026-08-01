"use client";
import React, { useState } from "react";
import { IconButton, type IconButtonProps } from "../../design/baseComponents/IconButton";
import { Copy, Check } from "lucide-react";
import { writeClipboardText } from "../clipboard/writeText";

export interface CopyIconButtonProps extends Omit<IconButtonProps, "onClick" | "children" | "icon"> {
    text: string;
}

export const CopyIconButton = ({ text, className, ...props }: CopyIconButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await writeClipboardText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Failed to copy:", e);
        }
    };

    return (
        <IconButton
            onClick={handleCopy}
            className={className}
            title="コピー"
            {...props}
        >
            {copied ? <Check className="h-4 w-4 text-brand-success" /> : <Copy className="h-4 w-4" />}
        </IconButton>
    );
};
