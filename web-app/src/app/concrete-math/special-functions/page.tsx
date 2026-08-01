import { SpecialFunctionsOperation } from "../../../features/concrete-math/ops/SpecialFunctionsOperation";
import { ConcreteMathSectionPage } from "../../../features/concrete-math/layouts/ConcreteMathSectionPage";

export default function SpecialFunctionsPage() {
    return (
        <ConcreteMathSectionPage
            sectionLabel="特殊関数"
            title="特殊関数"
            description="Gamma/Beta/Error function を対話的に計算し、代表的な性質を検証します。"
        >
            <SpecialFunctionsOperation />
        </ConcreteMathSectionPage>
    );
}
