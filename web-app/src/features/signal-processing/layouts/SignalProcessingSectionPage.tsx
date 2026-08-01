import { ReactNode } from "react";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";
import { Text } from "../../../design/baseComponents/Text";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { Page } from "../../../design/layouts/Page";
import { Stack } from "../../../design/primitives/Stack";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";

export interface SignalProcessingSectionPageProps {
    sectionLabel: string;
    title: string;
    description?: string;
    children: ReactNode;
}

export function SignalProcessingSectionPage({
    sectionLabel,
    title,
    description,
    children,
}: SignalProcessingSectionPageProps) {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.signalProcessing.ja, href: routes.signalProcessing.root },
                        { label: sectionLabel },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <Stack gap="xl">
                <Stack gap="xs">
                    <Text variant="h1" weight="bold" color="primary">
                        {title}
                    </Text>
                    {description && <Text color="secondary">{description}</Text>}
                </Stack>

                {children}
            </Stack>
        </Page>
    );
}