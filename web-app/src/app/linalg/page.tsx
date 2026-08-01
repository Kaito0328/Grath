import { Binary, Calculator, Route } from "lucide-react";
import { Page } from "../../design/layouts/Page";
import { ThemeSwitcher } from "../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../shared/ui/BreadcrumbTitle";
import { featureLabels } from "../../config/featureLabels";
import { AppMenu } from "../../shared/nav/AppMenu";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { FeatureLinkCard } from "../../shared/ui/FeatureLinkCard";
import { routes } from "../../config/routes";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { VariableManagerPanel } from "../../shared/variable-manager/VariableManagerPanel";

export default function LinalgPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.linalg.ja },
                    ]}
                />
            }
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <Stack gap="lg">
                <SectionHeader title="演算カテゴリ" />
                <View className="grid md:grid-cols-3 gap-4">
                    <FeatureLinkCard
                        href={routes.linalg.unary}
                        title="単項演算"
                        description="逆行列・固有値分解・LU/QR/SVD など、単一行列に対する解析を実行します。"
                        icon={<Calculator size={28} className="text-blue-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.linalg.binary}
                        title="二項演算"
                        description="行列同士の加算・乗算を行い、結果行列を確認します。"
                        icon={<Binary size={28} className="text-emerald-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.linalg.vector}
                        title="ベクトル演算"
                        description="行列×ベクトルと連立一次方程式 $Ax=b$ の計算を行います。"
                        icon={<Route size={28} className="text-amber-500" />}
                    />
                </View>

                <SectionHeader title="変数" />
                <VariableManagerPanel showHeader={false} />
            </Stack>
        </Page>
    );
}
