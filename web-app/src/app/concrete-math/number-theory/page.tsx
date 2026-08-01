import { NumberTheoryOperation } from "../../../features/concrete-math/ops/NumberTheoryOperation";
import { ConcreteMathSectionPage } from "../../../features/concrete-math/layouts/ConcreteMathSectionPage";

export default function NumberTheoryPage() {
    return (
        <ConcreteMathSectionPage
            sectionLabel="初等整数論"
            title="初等整数論"
            description="最大公約数(GCD)、素因数分解、剰余演算などの基本的な整数論の計算を行います。"
        >
            <NumberTheoryOperation />
        </ConcreteMathSectionPage>
    );
}
