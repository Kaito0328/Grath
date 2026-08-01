import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../shared/utils/cn';
import { RadiusKey } from '../tokens/keys';

const radiusMap: Record<RadiusKey, string> = {
    none: 'rounded-none',
    sm: 'rounded-brand-sm',
    md: 'rounded-brand-md',
    lg: 'rounded-brand-lg',
    full: 'rounded-brand-full',
};

const inputVariants = cva(
    'w-full transition-all outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'border-0 ring-1 ring-inset ring-slate-200 bg-slate-50 text-slate-900 shadow-sm hover:ring-slate-300 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-all dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:ring-slate-600 dark:focus:bg-slate-950',
                error: 'border-brand-danger bg-surface-card shadow-sm focus:ring-brand-danger/20',
            },
            size: {
                sm: 'px-2 py-1 text-sm',
                md: 'px-3 py-2 text-base',
                lg: 'px-4 py-3 text-lg',
            },
            rounded: radiusMap,
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            rounded: 'md',
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'color'>,
    VariantProps<typeof inputVariants> {
    multeline?: boolean;
}

/**
 * ユーザー入力を受け付けるための基本コンポーネントです。
 * `multeline` プロパティを有効にすることで textarea として動作します。
 */
export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    ({ className, variant, size, rounded, multeline = false, ...props }, ref) => {
        const Component = multeline ? 'textarea' : 'input';

        return (
            <Component
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={ref as any}
                className={cn(inputVariants({ variant, size, rounded, className }))}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';
