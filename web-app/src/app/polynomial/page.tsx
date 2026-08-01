import { Calculator, Sigma } from "lucide-react";
import { Page } from "../../design/layouts/Page";
import { ThemeSwitcher } from "../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../config/featureLabels";
import { AppMenu } from "../../shared/nav/AppMenu";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { FeatureLinkCard } from "../../shared/ui/FeatureLinkCard";
import { VariableManagerPanel } from "../../shared/variable-manager/VariableManagerPanel";
import { routes } from "../../config/routes";

export default function PolynomialPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.polynomial.ja },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <Stack gap="lg">
                <SectionHeader title="機能ページ" />
                <View className="grid md:grid-cols-2 gap-4">
                    <FeatureLinkCard
                        href={routes.polynomial.solver}
                        title="方程式ソルバ"
                        description="多項式方程式 $P(x)=0$ の解（根）を計算します。"
                        icon={<Calculator size={28} className="text-blue-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.polynomial.binary}
                        title="二項演算"
                        description="加算・減算・乗算・除算を多項式どうしで実行します。"
                        icon={<Sigma size={28} className="text-emerald-500" />}
                    />
                </View>

                <SectionHeader title="変数" />
                <VariableManagerPanel showHeader={false} />
            </Stack>
        </Page>
    );
}
