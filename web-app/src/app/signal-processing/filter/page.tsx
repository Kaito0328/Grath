import { FilterOperations } from "../../../features/signal-processing/FilterOperations";
import { SignalProcessingSectionPage } from "../../../features/signal-processing/layouts/SignalProcessingSectionPage";

export default function SignalProcessingFilterPage() {
	return (
		<SignalProcessingSectionPage
			sectionLabel="FIR"
			title="FIR フィルタ"
			description="FIR を設計して信号へ適用し、応答特性を確認します。"
		>
			<FilterOperations />
		</SignalProcessingSectionPage>
	);
}
