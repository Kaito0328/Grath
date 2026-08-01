import { Stack } from "../../design/primitives/Stack";
import Link from "next/link";

import { Tooltip } from "../../design/baseComponents/Tooltip";
import { Text } from "../../design/baseComponents/Text";
import { getTextVariantClasses, ColorVariantKey } from "../../design/tokens/variantUtils";

export interface TooltipLinkRowProps {
	href: string;
	label: string;
	description?: string;
	suffix?: string;
	colorVariants?: ColorVariantKey[];
}

export const TooltipLinkRow = ({
	href,
	label,
	description,
	suffix,
	colorVariants = [ColorVariantKey.Hover],
}: TooltipLinkRowProps) => {
	const content = description ?? label;

	return (
		<Tooltip content={content} placement="bottom">
			<Link href={href} className="no-underline">
				<Stack direction="row" gap={"sm"}>
					<Text
						color={"primary"}
						align="center"
						style={{ width: "1rem" }}
						className={[
							"transition-colors",
							getTextVariantClasses("primary", colorVariants),
						]
							.filter(Boolean)
							.join(" ")}
					>
						→
					</Text>
					<Text
						color={"primary"}
						className={[
							"transition-colors",
							getTextVariantClasses("primary", colorVariants),
						]
							.filter(Boolean)
							.join(" ")}
					>
						{label}
					</Text>
					{suffix ? (
						<Text color={"muted"}>
							{suffix}
						</Text>
					) : null}
				</Stack>
			</Link>
		</Tooltip>
	);
};
