"use client";

import { Page } from "../../design/layouts/Page";
import { ThemeSwitcher } from "../../design/features/ThemeSwitcher";
import { StatisticsHub } from "../../features/statistics/components/StatisticsHub";
import { BreadcrumbTitle } from "../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../config/featureLabels";
import { AppMenu } from "../../shared/nav/AppMenu";

export default function StatisticsPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.statistics.ja },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <StatisticsHub />
        </Page>
    );
}
