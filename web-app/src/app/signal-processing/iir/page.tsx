import { IirOperations } from "../../../features/signal-processing/IirOperations";
import { SignalProcessingSectionPage } from "../../../features/signal-processing/layouts/SignalProcessingSectionPage";

export default function SignalProcessingIirPage() {
	return (
		<SignalProcessingSectionPage
			sectionLabel="IIR"
			title="IIR フィルタ"
			description="Butterworth / Chebyshev の IIR を設計し、信号処理フローで比較します。"
		>
			<IirOperations />
		</SignalProcessingSectionPage>
	);
}
