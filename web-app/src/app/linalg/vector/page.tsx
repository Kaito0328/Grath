import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { LinalgOperations } from "../../../features/linalg/LinalgOperations";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../../config/featureLabels";
import { routes } from "../../../config/routes";
import { AppMenu } from "../../../shared/nav/AppMenu";

export default function LinalgVectorPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.linalg.ja, href: routes.linalg.root },
                        { label: "ベクトル演算" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <LinalgOperations forcedGroup="vector" />
        </Page>
    );
}
