"use client";
import { FiniteCalculusOperation } from "../../../features/concrete-math/ops/FiniteCalculusOperation";
import { ConcreteMathSectionPage } from "../../../features/concrete-math/layouts/ConcreteMathSectionPage";

export default function FiniteCalculusPage() {
    return (
        <ConcreteMathSectionPage
            sectionLabel="有限差分・和分"
            title="有限差分・和分"
            description="多項式の離散的な差分（微分）と和分（積分）を計算します。"
        >
            <FiniteCalculusOperation />
        </ConcreteMathSectionPage>
    );
}
