import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { RationalOperations } from "../../../features/algebraic/ops/RationalOperations";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";
import { AlgebraicTypeLabels } from "../../../features/algebraic/shared/typeLabels";

export default function AlgebraicRationalPage() {
	return (
		<Page
			title={
				<BreadcrumbTitle
					items={[
						{ label: featureLabels.algebraic.ja, href: routes.algebraic.root },
						{ label: AlgebraicTypeLabels.rational.ja },
					]}
				/>
			}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<RationalOperations />
		</Page>
	);
}
