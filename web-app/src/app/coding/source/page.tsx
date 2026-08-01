import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { featureLabels } from "../../../config/featureLabels";
import { routes } from "../../../config/routes";
import { SourceCodingOperations } from "../../../features/source-coding/SourceCodingOperations";

export default function CodingSourcePage() {
	return (
		<Page
			title={
				<BreadcrumbTitle
					items={[
						{ label: featureLabels.coding.ja, href: routes.coding.root },
						{ label: featureLabels.codingSource.ja },
					]}
				/>
			}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<SourceCodingOperations />
		</Page>
	);
}
