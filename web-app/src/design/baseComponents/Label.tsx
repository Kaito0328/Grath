import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../shared/utils/cn';
import { Text } from './Text';
import { SurfaceColorKey } from '../tokens/keys';
import { Flex, FlexProps } from "../primitives/Flex";

const bgMap: Record<SurfaceColorKey, string> = {
    transparent: 'bg-transparent',
    base: 'bg-surface-base',
    muted: 'bg-surface-muted',
    card: 'bg-surface-card',
    // Labelの色の実体を独自に定義（例：少し透過させるなど）
    primary: 'bg-brand-primary text-white',
    secondary: 'bg-brand-secondary text-white',
    danger: 'bg-brand-danger text-white',
    success: 'bg-brand-success text-white',
    heart: 'bg-brand-heart text-white',
    warning: 'bg-brand-warning text-white',
    info: 'bg-brand-info text-white',
};

const labelVariants = cva('', {
    variants: {
        variant: {
            default: '',
            outline: 'border border-brand-secondary',
            filled: 'bg-surface-muted',
        },
        bg: bgMap,
    },
    defaultVariants: {
        variant: 'default',
        bg: 'transparent',
    },
});

export interface LabelProps
    extends Omit<FlexProps, 'bg' | 'color'>,
    VariantProps<typeof labelVariants> {
    label?: string;
    icon?: React.ReactNode;
    iconRight?: boolean;
}

/**
 * テキストとアイコン（オプション）を表示するためのラベルコンポーネントです。
 */
export const Label = ({ className, label, icon, iconRight = false, variant, bg, ...props }: LabelProps) => {
    return (
        <Flex
            className={cn(labelVariants({ variant, bg, className }))}
            {...props}
        >
            {!iconRight && icon && <span className={cn(label && "mr-2")}>{icon}</span>}
            {label && <Text variant="detail" color="inherit">{label}</Text>}
            {iconRight && icon && <span className={cn(label && "ml-2")}>{icon}</span>}
        </Flex>
    );
};

Label.displayName = 'Label';
