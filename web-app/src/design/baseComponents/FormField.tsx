import React from 'react';
import { Stack } from '../primitives/Stack';
import { Text } from './Text';
import { View } from '../primitives/View';
import { cn } from '../../shared/utils/cn';

export interface FormFieldProps {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * ラベル、説明文、エラーメッセージと入力要素をセットにしたフォームフィールドコンポーネントです。
 */
export function FormField({
    label,
    description,
    error,
    required,
    children,
    className,
}: FormFieldProps) {
    return (
        <Stack gap="sm" className={cn('w-full', className)}>
            {label && (
                <Text variant="detail" className="flex items-center gap-1">
                    {label}
                    {required && (
                        <Text span variant="detail" color="danger">
                            *
                        </Text>
                    )}
                </Text>
            )}
            {description && (
                <Text variant="xs" color="muted">
                    {description}
                </Text>
            )}
            <View className="w-full">
                {children}
            </View>
            {error && (
                <Text variant="xs" color="danger">
                    {error}
                </Text>
            )}
        </Stack>
    );
}
