import React from "react";
import { Container } from "../primitives/Container";
import { Flex } from "../primitives/Flex";
import { View } from "../primitives/View";

export function Page({ children, title, leading, actions }: { children?: React.ReactNode; title?: React.ReactNode; leading?: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <View className="flex flex-col min-h-screen bg-background text-foreground">
            <View
                as="header"
                bg="card"
                shadow="sm"
                border="base"
                className="sticky top-0 z-10 border-x-0 border-t-0"
            >
                <Container size="full" className="px-4 py-4">
                    <Flex align="center" justify="between" gap="sm">
                        <Flex align="center" gap="sm" className="min-w-0">
                            {leading}
                            {title}
                        </Flex>
                        <View>{actions}</View>
                    </Flex>
                </Container>
            </View>

            <View as="main" className="flex-1">
                <Container size="full" className="w-full max-w-7xl p-6">
                    {children}
                </Container>
            </View>
        </View>
    );
}
