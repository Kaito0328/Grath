import React from 'react';
import { Flex } from '../primitives/Flex';
import { Text } from './Text';

import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    className?: string;
}

/**
 * ページの階層構造を示すナビゲーションコンポーネントです。
 */
export function Breadcrumbs({
    items,
    separator = <ChevronRight size={14} className="text-slate-400" />,
    className
}: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <Flex gap="sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <React.Fragment key={index}>
                            <Flex gap="sm">
                                {item.icon}
                                {isLast || !item.href ? (
                                    <Text
                                        variant="xs"
                                        color={isLast ? 'primary' : 'muted'}
                                    >
                                        {item.label}
                                    </Text>
                                ) : (
                                    <a
                                        href={item.href}
                                        className="text-xs font-medium text-slate-500 hover:text-brand-primary transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                )}
                            </Flex>
                            {!isLast && separator}
                        </React.Fragment>
                    );
                })}
            </Flex>
        </nav>
    );
}
