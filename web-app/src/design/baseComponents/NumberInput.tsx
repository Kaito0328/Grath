import React from "react";
import { Input, type InputProps } from "./Input";

export interface NumberInputProps extends Omit<InputProps, "value" | "onChange" | "type"> {
    value: number;
    /** Emits NaN if input is cleared */
    onChangeNumber: (val: number) => void;
    allowFloat?: boolean;
}

/**
 * A wrapper around Input that handles number parsing safely, 
 * treating empty inputs as NaN to avoid 0 coercion bugs.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ value, onChangeNumber, allowFloat = true, ...props }, ref) => {

        // Controlled value display
        const displayValue = Number.isFinite(value) ? String(value) : "";

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const text = e.target.value;
            if (text === "") {
                onChangeNumber(Number.NaN);
                return;
            }
            const parsed = allowFloat ? parseFloat(text) : parseInt(text, 10);
            onChangeNumber(parsed);
        };

        return (
            <Input
                ref={ref}
                type="number"
                value={displayValue}
                onChange={handleChange}
                step={allowFloat ? "any" : "1"}
                {...props}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";
