import { SummationOperation } from "../../../features/concrete-math/ops/SummationOperation";
import { ConcreteMathSectionPage } from "../../../features/concrete-math/layouts/ConcreteMathSectionPage";

export default function SummationPage() {
    return (
        <ConcreteMathSectionPage
            sectionLabel="数列の和と特殊な数"
            title="数列の和と特殊な数"
            description="等差・等比級数の記号的計算や、ベルヌーイ数・スターリング数などの数学的定数を計算します。"
        >
            <SummationOperation />
        </ConcreteMathSectionPage>
    );
}
