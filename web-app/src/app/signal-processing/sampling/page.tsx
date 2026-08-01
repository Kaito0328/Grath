import { SamplingOperations } from "../../../features/signal-processing/SamplingOperations";
import { SignalProcessingSectionPage } from "../../../features/signal-processing/layouts/SignalProcessingSectionPage";

export default function SignalProcessingSamplingPage() {
	return (
		<SignalProcessingSectionPage
			sectionLabel="サンプリング"
			title="サンプリング"
			description="間引き(decimate)とゼロ挿入(expand)を比較してサンプリングの基礎を確認します。"
		>
			<SamplingOperations />
		</SignalProcessingSectionPage>
	);
}
