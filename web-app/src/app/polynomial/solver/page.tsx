import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { PolynomialOperations } from "../../../features/algebraic/ops/PolynomialOperations";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";
import { AppMenu } from "../../../shared/nav/AppMenu";

export default function PolynomialSolverPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.polynomial.ja, href: routes.polynomial.root },
                        { label: "方程式ソルバ" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <PolynomialOperations forcedGroup="unary" />
        </Page>
    );
}
