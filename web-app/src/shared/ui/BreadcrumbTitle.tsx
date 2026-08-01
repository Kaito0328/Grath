import { Stack } from "../../design/primitives/Stack";
import Link from "next/link";
import { Text } from "../../design/baseComponents/Text";
export type BreadcrumbItem = {
	label: string;
	href?: string;
};

export interface BreadcrumbTitleProps {
	items: BreadcrumbItem[];
}

export const BreadcrumbTitle = ({ items }: BreadcrumbTitleProps) => {
	return (
		<Stack direction="row" gap="sm" className="min-w-0">
			{items.map((item, idx) => {
				const isLast = idx === items.length - 1;
				const node = item.href ? (
					<Link href={item.href} className="no-underline">
						<Text color={"main"}>
							{item.label}
						</Text>
					</Link>
				) : (
					<Text color={"main"}>
						{item.label}
					</Text>
				);

				return (
					<Stack direction="row" key={`${item.label}-${idx}`} gap="sm">
						{node}
						{!isLast && (
							<Text color={"muted"}>
								/
							</Text>
						)}
					</Stack>
				);
			})}
		</Stack>
	);
};
