import { AliasingLab } from "../../../features/signal-processing/AliasingLab";
import { SignalProcessingSectionPage } from "../../../features/signal-processing/layouts/SignalProcessingSectionPage";

export default function SignalProcessingAliasingPage() {
	return (
		<SignalProcessingSectionPage
			sectionLabel="ワークフロー"
			title="エイリアシング・ワークフロー"
			description="生成→前置フィルタ→ダウンサンプリング→アップサンプリング→復元の流れを一括で検証します。"
		>
			<AliasingLab />
		</SignalProcessingSectionPage>
	);
}
