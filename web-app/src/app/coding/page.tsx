import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { Page } from "../../design/layouts/Page";
import { ThemeSwitcher } from "../../design/features/ThemeSwitcher";
import { AppMenu } from "../../shared/nav/AppMenu";
import { BreadcrumbTitle } from "../../shared/ui/BreadcrumbTitle";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { VariableManagerPanel } from "../../shared/variable-manager/VariableManagerPanel";
import { routes } from "../../config/routes";
import { featureLabels } from "../../config/featureLabels";
import { FeatureLinkCard } from "../../shared/ui/FeatureLinkCard";
import { Binary, RadioTower, Waves, Workflow } from "lucide-react";

export default function CodingPage() {
	return (
		<Page
			title={<BreadcrumbTitle items={[{ label: featureLabels.coding.ja }]} />}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<Stack gap={"lg"}>
				<SectionHeader title="機能ページ" />
				<View className="grid md:grid-cols-2 gap-4">
					<FeatureLinkCard
						href={routes.coding.source}
						title={featureLabels.codingSource.ja}
						description="テキストやバイト列の圧縮と復号を確認します。"
						icon={<Waves size={28} className="text-blue-500" />}
					/>
					<FeatureLinkCard
						href={routes.coding.channel}
						title={featureLabels.codingChannel.ja}
						description="RS / BCH / Hamming による誤り訂正を検証します。"
						icon={<RadioTower size={28} className="text-emerald-500" />}
					/>
					<FeatureLinkCard
						href={routes.coding.comm}
						title={featureLabels.codingComm.ja}
						description="Source→Channel→BSC→Decode のE2Eフローを体験します。"
						icon={<Workflow size={28} className="text-amber-500" />}
					/>
					<FeatureLinkCard
						href={routes.coding.gf2}
						title={featureLabels.codingGf2.ja}
						description="生成行列G・検査行列H・シンドローム計算を行います。"
						icon={<Binary size={28} className="text-indigo-500" />}
					/>
				</View>

				<SectionHeader title="変数" />
				<VariableManagerPanel showHeader={false} />
			</Stack>
		</Page>
	);
}
