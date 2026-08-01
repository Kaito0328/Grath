"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { Drawer } from "../../../design/baseComponents/Drawer";
import { IconButton } from "../../../design/baseComponents/IconButton";
import { LinkText } from "../../../design/baseComponents/LinkText";
import { MenuIcon } from "../../../design/baseComponents/MenuIcon";
import { Text } from "../../../design/baseComponents/Text";
import { routes } from "../../../config/routes";
import { featureLabels } from "../../../config/featureLabels";
import { AlgebraicTypeLabels } from "../shared/typeLabels";

const items = [
	{ href: routes.algebraic.expr, label: AlgebraicTypeLabels.expr.ja },
	{ href: routes.algebraic.rational, label: AlgebraicTypeLabels.rational.ja },
];

const Chevron = ({ open }: { open: boolean }) => {
	return (
		<Text
			className={["inline-block transition-transform", open ? "rotate-90" : ""].join(" ")}
			color={"muted"}
		>
			›
		</Text>
	);
};

export const AlgebraicMenu = () => {
	const [open, setOpen] = useState(false);
	const [algebraicOpen, setAlgebraicOpen] = useState(true);
	const pathname = usePathname();

	const activeHref = useMemo(() => {
		return items.find((i) => i.href === pathname)?.href ?? null;
	}, [pathname]);

	return (
		<>
			<IconButton onClick={() => setOpen(true)}>
				<MenuIcon className="h-5 w-5" />
			</IconButton>

			<Drawer open={open} title="Menu" onClose={() => setOpen(false)}>
				<Stack gap={"lg"}>
					<Stack gap={"sm"}>
						<Stack direction="row">
							<LinkText
								href={routes.algebraic.root}
								onClick={() => setOpen(false)}
								className="font-bold text-foreground hover:bg-surface-muted"
							>
								{featureLabels.algebraic.ja}
							</LinkText>
							<IconButton
								onClick={() => setAlgebraicOpen((v) => !v)}
								variant="ghost"
							>
								<Chevron open={algebraicOpen} />
							</IconButton>
						</Stack>

						{algebraicOpen && (
							<Stack gap={"sm"} className="pl-3">
								{items.map((item) => (
									<LinkText
										key={item.href}
										href={item.href}
										onClick={() => setOpen(false)}
										className={item.href === activeHref ? "font-bold text-foreground" : "font-normal text-muted-foreground hover:bg-surface-muted"}
									>
										{item.label}
									</LinkText>
								))}
							</Stack>
						)}
					</Stack>

					<Text color={"muted"}>
						Escで閉じます
					</Text>
				</Stack>
			</Drawer>
		</>
	);
};
