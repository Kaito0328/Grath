import { SpectrumOperations } from "../../../features/signal-processing/SpectrumOperations";
import { SignalProcessingSectionPage } from "../../../features/signal-processing/layouts/SignalProcessingSectionPage";

export default function SignalProcessingSpectrumPage() {
	return (
		<SignalProcessingSectionPage
			sectionLabel="スペクトル"
			title="スペクトル解析"
			description="DFT の片側振幅スペクトルを計算して、周波数成分を可視化します。"
		>
			<SpectrumOperations />
		</SignalProcessingSectionPage>
	);
}
