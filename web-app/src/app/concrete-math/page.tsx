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
import { FeatureLinkCard } from "../../shared/ui/FeatureLinkCard";
import { Calculator, FunctionSquare, Infinity as InfinityIcon, ListOrdered, Sigma } from "lucide-react";

export default function ConcreteMathHomePage() {
    return (
        <Page
            title={<BreadcrumbTitle items={[{ label: featureLabels.concreteMath.ja }]} />}
            leading={<AppMenu />}
            actions={<ThemeSwitcher />}
        >
            <Stack gap={"lg"}>
                <SectionHeader title="演算ページ" />

                <View className="grid md:grid-cols-2 gap-4">
                    <FeatureLinkCard
                        href={routes.concreteMath.recurrence}
                        title="線形漸化式"
                        description="等差・等比・フィボナッチ型の漸化式を解き、一般項を確認します。"
                        icon={<ListOrdered size={28} className="text-blue-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.concreteMath.finiteCalculus}
                        title="有限差分"
                        description="差分・和分や特殊多項式の生成を試せます。"
                        icon={<Sigma size={28} className="text-emerald-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.concreteMath.summation}
                        title="総和"
                        description="等差・等比・特殊数列の和を記号的に計算します。"
                        icon={<InfinityIcon size={28} className="text-indigo-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.concreteMath.numberTheory}
                        title="数論"
                        description="GCD/LCM、素因数分解、剰余演算を確認します。"
                        icon={<Calculator size={28} className="text-amber-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.concreteMath.specialFunctions}
                        title="特殊関数"
                        description="ガンマ関数やベータ関数などの値を計算します。"
                        icon={<FunctionSquare size={28} className="text-rose-500" />}
                    />
                </View>

                <SectionHeader title="変数" />

                <VariableManagerPanel showHeader={false} />
            </Stack>
        </Page>
    );
}
