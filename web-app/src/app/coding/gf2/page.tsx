import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { featureLabels } from "../../../config/featureLabels";
import { routes } from "../../../config/routes";
import { Gf2AnalysisOperations } from "../../../features/coding/Gf2AnalysisOperations";

export default function CodingGf2Page() {
	return (
		<Page
			title={
				<BreadcrumbTitle
					items={[
						{ label: featureLabels.coding.ja, href: routes.coding.root },
						{ label: featureLabels.codingGf2.ja },
					]}
				/>
			}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<Gf2AnalysisOperations />
		</Page>
	);
}
