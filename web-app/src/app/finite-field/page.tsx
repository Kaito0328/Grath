import { FlaskConical, ShieldCheck } from "lucide-react";
import { Page } from "../../design/layouts/Page";
import { ThemeSwitcher } from "../../design/features/ThemeSwitcher";
import { BreadcrumbTitle } from "../../shared/ui/BreadcrumbTitle";
import { AppMenu } from "../../shared/nav/AppMenu";
import { featureLabels } from "../../config/featureLabels";
import { routes } from "../../config/routes";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { FeatureLinkCard } from "../../shared/ui/FeatureLinkCard";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { VariableManagerPanel } from "../../shared/variable-manager/VariableManagerPanel";

export default function FiniteFieldPage() {
    return (
        <Page
            title={
                <BreadcrumbTitle
                    items={[
                        { label: featureLabels.finiteField.ja },
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
                        href={routes.finiteField.gfp5}
                        title="GF(5) 演算"
                        description="GF(5) 上の加算・乗算・逆元を確認します。"
                        icon={<FlaskConical size={28} className="text-blue-500" />}
                    />
                    <FeatureLinkCard
                        href={routes.finiteField.gf256}
                        title="GF(256) 演算"
                        description="AES 既約多項式での乗算と逆元チェックを実行します。"
                        icon={<ShieldCheck size={28} className="text-emerald-500" />}
                    />
                </View>

                <SectionHeader title="変数" />
                <VariableManagerPanel showHeader={false} />
            </Stack>
        </Page>
    );
}
