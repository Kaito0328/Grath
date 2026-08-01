"use client";

import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { HypothesisTestingWizard } from "../../../features/statistics/components/HypothesisTestingWizard";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../../config/featureLabels";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { routes } from "../../../config/routes";

export default function TestingPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.statistics.ja, href: routes.statistics.root },
                        { label: "仮説検定" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <HypothesisTestingWizard />
        </Page>
    );
}
