import { ReactNode } from "react";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { Page } from "../../../design/layouts/Page";
import { Text } from "../../../design/baseComponents/Text";
import { Stack } from "../../../design/primitives/Stack";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { AppMenu } from "../../../shared/nav/AppMenu";

export interface ConcreteMathSectionPageProps {
    sectionLabel: string;
    title: string;
    description?: string;
    children: ReactNode;
}

export function ConcreteMathSectionPage({ sectionLabel, title, description, children }: ConcreteMathSectionPageProps) {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.concreteMath.ja, href: routes.concreteMath.root },
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