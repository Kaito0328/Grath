import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { Page } from "../../design/layouts/Page";
import { ThemeSwitcher } from "../../design/features/ThemeSwitcher";
import { AppMenu } from "../../shared/nav/AppMenu";
import { VariableManagerPanel } from "../../shared/variable-manager/VariableManagerPanel";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { BreadcrumbTitle } from "../../shared/ui/BreadcrumbTitle";
import { routes } from "../../config/routes";
import { featureLabels } from "../../config/featureLabels";
import { AlgebraicTypeLabels } from "../../features/algebraic/shared/typeLabels";
import { FeatureLinkCard } from "../../shared/ui/FeatureLinkCard";
import { Sigma, DivideCircle } from "lucide-react";

export default function AlgebraicPage() {
	return (
		<Page
			title={<BreadcrumbTitle items={[{ label: featureLabels.algebraic.ja }]} />}
			leading={<AppMenu />}
			actions={<ThemeSwitcher />}
		>
			<Stack gap={"lg"}>
				<SectionHeader title="演算ページ" />

				<View className="grid md:grid-cols-2 gap-4">
					<FeatureLinkCard
						href={routes.algebraic.expr}
						title={AlgebraicTypeLabels.expr.ja}
						description="文字式の簡約、加算、乗算などの記号演算を行います。"
						icon={<Sigma size={28} className="text-blue-500" />}
					/>
					<FeatureLinkCard
						href={routes.algebraic.rational}
						title={AlgebraicTypeLabels.rational.ja}
						description="有理数の簡約・四則演算を厳密形式で実行します。"
						icon={<DivideCircle size={28} className="text-emerald-500" />}
						caption="Rational"
					/>
				</View>

				<SectionHeader title="変数" />

				<VariableManagerPanel showHeader={false} />
			</Stack>
		</Page>
	);
}
