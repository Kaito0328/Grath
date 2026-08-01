import { ConvolutionOperations } from "../../../features/signal-processing/ConvolutionOperations";
import { SignalProcessingSectionPage } from "../../../features/signal-processing/layouts/SignalProcessingSectionPage";

export default function SignalProcessingConvolutionPage() {
	return (
		<SignalProcessingSectionPage
			sectionLabel="畳み込み"
			title="畳み込み"
			description="離散信号の畳み込みを計算し、入力と出力の波形を比較します。"
		>
			<ConvolutionOperations />
		</SignalProcessingSectionPage>
	);
}
