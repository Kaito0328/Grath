import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { featureLabels } from "../../../config/featureLabels";
import { routes } from "../../../config/routes";
import { FiniteFieldOperations } from "../../../features/finite-field/FiniteFieldOperations";

export default function FiniteFieldGf256Page() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.finiteField.ja, href: routes.finiteField.root },
                        { label: "GF(256) 演算" },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <FiniteFieldOperations
                defaultOp="gf256_mul"
                allowedOps={["gf256_mul", "gf256_inv_check"]}
            />
        </Page>
    );
}
