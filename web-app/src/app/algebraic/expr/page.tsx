import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { ComplexOperations } from "../../../features/algebraic/ops/ComplexOperations";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";
import { AlgebraicTypeLabels } from "../../../features/algebraic/shared/typeLabels";

export default function AlgebraicExprPage() {
	return (
		<Page
			title={
				<BreadcrumbTitle
					items={[
						{ label: featureLabels.algebraic.ja, href: routes.algebraic.root },
						{ label: AlgebraicTypeLabels.expr.ja },
					]}
				/>
			}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<ComplexOperations />
		</Page>
	);
}
