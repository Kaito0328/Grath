import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { LinalgOperations } from "../../../features/linalg/LinalgOperations";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../../config/featureLabels";
import { routes } from "../../../config/routes";
import { AppMenu } from "../../../shared/nav/AppMenu";

export default function LinalgBinaryPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.linalg.ja, href: routes.linalg.root },
                        { label: "二項演算" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <LinalgOperations forcedGroup="binary" />
        </Page>
    );
}
