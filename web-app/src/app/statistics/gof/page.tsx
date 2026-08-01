"use client";

import React from "react";
import { Page } from "../../../design/layouts/Page";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { GoodnessOfFitLab } from "../../../features/statistics/components/GoodnessOfFitLab";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";

export default function GoodnessOfFitPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.statistics.ja, href: routes.statistics.root },
                        { label: "適合度検定ラボ" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <GoodnessOfFitLab />
        </Page>
    );
}
