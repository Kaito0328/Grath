"use client";

import React from "react";
import { Page } from "../../../design/layouts/Page";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { RegressionLab } from "../../../features/statistics/components/RegressionLab";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";

export default function RegressionPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.statistics.ja, href: routes.statistics.root },
                        { label: "回帰分析ラボ" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <RegressionLab />
        </Page>
    );
}
