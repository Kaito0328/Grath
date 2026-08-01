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
import { Activity, AudioLines, ChartNoAxesColumn, Filter, Waves, Workflow } from "lucide-react";

export default function SignalProcessingHomePage() {
	return (
		<Page
			title={<BreadcrumbTitle items={[{ label: featureLabels.signalProcessing.ja }]} />}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<Stack gap={"lg"}>
				<SectionHeader title="機能ページ" />
				<View className="grid md:grid-cols-2 gap-4">
					<FeatureLinkCard
						href={routes.signalProcessing.convolution}
						title="畳み込み"
						description="離散信号の畳み込みを実行し、結果系列を確認します。"
						icon={<Waves size={28} className="text-blue-500" />}
					/>
					<FeatureLinkCard
						href={routes.signalProcessing.sampling}
						title="サンプリング"
						description="decimate / expand（0挿入）による標本化を試せます。"
						icon={<Activity size={28} className="text-emerald-500" />}
					/>
					<FeatureLinkCard
						href={routes.signalProcessing.filter}
						title="FIR"
						description="FIR係数で信号へフィルタを適用します。"
						icon={<Filter size={28} className="text-indigo-500" />}
					/>
					<FeatureLinkCard
						href={routes.signalProcessing.iir}
						title="IIR"
						description="Butterworth / Chebyshev のIIR設計と適用を行います。"
						icon={<AudioLines size={28} className="text-amber-500" />}
					/>
					<FeatureLinkCard
						href={routes.signalProcessing.spectrum}
						title="スペクトル"
						description="DFTベースの振幅スペクトルを可視化します。"
						icon={<ChartNoAxesColumn size={28} className="text-rose-500" />}
					/>
					<FeatureLinkCard
						href={routes.signalProcessing.aliasing}
						title="ワークフロー"
						description="生成→フィルタ→間引き→復元の一連フローを検証します。"
						icon={<Workflow size={28} className="text-cyan-500" />}
					/>
				</View>

				<SectionHeader title="変数" />
				<VariableManagerPanel showHeader={false} />
			</Stack>
		</Page>
	);
}
