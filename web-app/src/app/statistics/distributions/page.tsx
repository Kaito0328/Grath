"use client";

import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { DistributionSimulator } from "../../../features/statistics/components/DistributionSimulator";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../../config/featureLabels";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { routes } from "../../../config/routes";

export default function DistributionsPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.statistics.ja, href: routes.statistics.root },
                        { label: "確率分布" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <DistributionSimulator />
        </Page>
    );
}
