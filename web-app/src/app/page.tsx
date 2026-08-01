import { Stack } from "../design/primitives/Stack";
import { View } from "../design/primitives/View";
import { Page } from "../design/layouts/Page";
import { ThemeSwitcher } from "../design/features/ThemeSwitcher";
import { SectionHeader } from "../shared/ui/SectionHeader";
import { VariableManagerPanel } from "../shared/variable-manager/VariableManagerPanel";
import { AppMenu } from "../shared/nav/AppMenu";
import { routes } from "../config/routes";
import { featureLabels } from "../config/featureLabels";
import { FeatureLinkCard } from "../shared/ui/FeatureLinkCard";
import { Activity, Binary, FlaskConical, Layers, LineChart, Sigma, TrendingUp, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <Page leading={<AppMenu />} actions={<ThemeSwitcher />}>
      <Stack gap={"lg"}>
        <SectionHeader title="クレート一覧" />
        <View className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FeatureLinkCard
            href={routes.signalProcessing.root}
            title={featureLabels.signalProcessing.ja}
            description="畳み込み、フィルタ、サンプリング、スペクトル解析を扱います。"
            icon={<Activity size={28} className="text-emerald-500" />}
          />
          <FeatureLinkCard
            href={routes.algebraic.root}
            title={featureLabels.algebraic.ja}
            description="式・有理数・複素数の記号演算を実行します。"
            icon={<Sigma size={28} className="text-blue-500" />}
          />
          <FeatureLinkCard
            href={routes.polynomial.root}
            title={featureLabels.polynomial.ja}
            description="多項式方程式の解と多項式演算を扱います。"
            icon={<LineChart size={28} className="text-brand-heart" />}
          />
          <FeatureLinkCard
            href={routes.linalg.root}
            title={featureLabels.linalg.ja}
            description="行列分解、固有値問題、連立一次方程式を解きます。"
            icon={<Layers size={28} className="text-amber-500" />}
          />
          <FeatureLinkCard
            href={routes.coding.root}
            title={featureLabels.coding.ja}
            description="情報源符号化と通信路符号化、GF(2)解析を提供します。"
            icon={<Binary size={28} className="text-indigo-500" />}
          />
          <FeatureLinkCard
            href={routes.finiteField.root}
            title={featureLabels.finiteField.ja}
            description="GF(5) / GF(256) の有限体演算を確認します。"
            icon={<FlaskConical size={28} className="text-cyan-500" />}
          />
          <FeatureLinkCard
            href={routes.concreteMath.root}
            title={featureLabels.concreteMath.ja}
            description="漸化式、有限差分、総和、数論、特殊関数を学べます。"
            icon={<Zap size={28} className="text-yellow-500" />}
          />
          <FeatureLinkCard
            href={routes.statistics.root}
            title={featureLabels.statistics.ja}
            description="分布、仮説検定、相関、回帰などを横断的に扱います。"
            icon={<TrendingUp size={28} className="text-rose-500" />}
          />
        </View>

        <SectionHeader title="変数" />
        <VariableManagerPanel showHeader={false} />
      </Stack>
    </Page>
  );
}
