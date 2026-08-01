import React from 'react';
import { cn } from '../../shared/utils/cn';
import { Button, type ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

/**
 * アイコンのみを表示するためのボタンコンポーネントです。
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, icon, children, size = 'icon', ...props }, ref) => {
        return (
            <Button
                ref={ref}
                size={size}
                className={cn(className)}
                {...props}
            >
                {icon || children}
            </Button>
        );
    }
);

IconButton.displayName = 'IconButton';
