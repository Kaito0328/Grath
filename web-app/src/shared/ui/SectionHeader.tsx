import { Text } from "../../design/baseComponents/Text";
import { View } from "../../design/primitives/View";

import { cn } from "../../shared/utils/cn";
import type { FontWeightKey } from "../../design/tokens/keys";

export interface SectionHeaderProps {
	title: string;
	className?: string;
	size?: "h1" | "h2" | "h3" | "h4" | "body" | "detail" | "xs";
	weight?: FontWeightKey;
}

export const SectionHeader = ({
	title,
	className,
	size = "h4",
}: SectionHeaderProps) => {
	return (
		<View className={cn("border-b border-slate-300 dark:border-slate-700 pb-3 mb-4 w-full", className)}>
			<Text variant={size} weight="semibold" className="text-slate-700 dark:text-slate-300">
				{title}
			</Text>
		</View>
	);
};
