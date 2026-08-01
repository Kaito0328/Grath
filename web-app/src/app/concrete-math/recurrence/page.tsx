import { RecurrenceSolverOperation } from "../../../features/concrete-math/ops/RecurrenceSolverOperation";
import { ConcreteMathSectionPage } from "../../../features/concrete-math/layouts/ConcreteMathSectionPage";

export default function RecurrenceSolverPage() {
    return (
        <ConcreteMathSectionPage
            sectionLabel="線形漸化式"
            title="線形漸化式"
            description="同次/非同次の線形漸化式を解き、一般項・評価値・検証まで実行します。"
        >
            <RecurrenceSolverOperation />
        </ConcreteMathSectionPage>
    );
}
