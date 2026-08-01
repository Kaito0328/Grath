import { Page } from "../../../design/layouts/Page";
import { ThemeSwitcher } from "../../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../../shared/ui/BreadcrumbTitle";
import { AppMenu } from "../../../shared/nav/AppMenu";
import { featureLabels } from "../../../config/featureLabels";
import { routes } from "../../../config/routes";
import { CodingOperations } from "../../../features/coding/CodingOperations";

export default function CodingChannelPage() {
	return (
		<Page
			title={
				<BreadcrumbTitle
					items={[
						{ label: featureLabels.coding.ja, href: routes.coding.root },
						{ label: featureLabels.codingChannel.ja },
					]}
				/>
			}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<CodingOperations />
		</Page>
	);
}
