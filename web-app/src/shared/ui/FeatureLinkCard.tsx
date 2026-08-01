import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "../../design/baseComponents/Card";
import { Text } from "../../design/baseComponents/Text";
import { Stack } from "../../design/primitives/Stack";
import { Flex } from "../../design/primitives/Flex";
import { View } from "../../design/primitives/View";

export interface FeatureLinkCardProps {
	href: string;
	title: string;
	description: string;
	icon: ReactNode;
	caption?: string;
}

export function FeatureLinkCard({ href, title, description, icon, caption }: FeatureLinkCardProps) {
	return (
		<Link href={href} className="no-underline group">
			<Card border="base" className="h-full border-slate-200 dark:border-slate-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
				<Stack gap="md" className="h-full">
					<Flex align="center" justify="between">
						<View bg="muted" rounded="lg" padding="md">
							{icon}
						</View>
						<ArrowRight size={20} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
					</Flex>
					<Stack gap="xs" className="flex-1">
						<Text variant="h3" weight="bold">{title}</Text>
						<Text color="secondary" variant="detail">{description}</Text>
					</Stack>
					{caption ? (
						<Text variant="xs" color="muted">{caption}</Text>
					) : null}
				</Stack>
			</Card>
		</Link>
	);
}
