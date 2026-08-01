"use client";
import { Stack } from "../../design/primitives/Stack";
import { Flex } from "../../design/primitives/Flex";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { Drawer } from "../../design/baseComponents/Drawer";
import { IconButton } from "../../design/baseComponents/IconButton";
import { LinkText } from "../../design/baseComponents/LinkText";
import { MenuIcon } from "../../design/baseComponents/MenuIcon";
import { Text } from "../../design/baseComponents/Text";
import { routes } from "../../config/routes";
import { featureLabels } from "../../config/featureLabels";

type MenuItem = { key: string; href: string; label: string };
type MenuSection = { key: string; item: MenuItem; children?: MenuItem[] };

const sections: MenuSection[] = [
	{
		key: "home",
		item: { key: "home", href: routes.home, label: "ホーム" },
	},
	{
		key: "signalProcessing",
		item: { key: "signalProcessing", href: routes.signalProcessing.root, label: featureLabels.signalProcessing.ja },
		children: [
			{ key: "signalProcessing.convolution", href: routes.signalProcessing.convolution, label: "畳み込み" },
			{ key: "signalProcessing.sampling", href: routes.signalProcessing.sampling, label: "サンプリング" },
			{ key: "signalProcessing.filter", href: routes.signalProcessing.filter, label: "FIR" },
			{ key: "signalProcessing.iir", href: routes.signalProcessing.iir, label: "IIR" },
			{ key: "signalProcessing.spectrum", href: routes.signalProcessing.spectrum, label: "スペクトル" },
			{ key: "signalProcessing.aliasing", href: routes.signalProcessing.aliasing, label: "エイリアシング" },
		],
	},
	{
		key: "algebraic",
		item: { key: "algebraic", href: routes.algebraic.root, label: featureLabels.algebraic.ja },
		children: [
			{ key: "algebraic.expr", href: routes.algebraic.expr, label: "文字式 (Expr)" },
			{ key: "algebraic.rational", href: routes.algebraic.rational, label: "有理数 (Rational)" },
		],
	},
	{
		key: "polynomial",
		item: { key: "polynomial", href: routes.polynomial.root, label: featureLabels.polynomial.ja },
		children: [
			{ key: "polynomial.solver", href: routes.polynomial.solver, label: "方程式ソルバ" },
			{ key: "polynomial.binary", href: routes.polynomial.binary, label: "二項演算" },
		],
	},
	{
		key: "linalg",
		item: { key: "linalg", href: routes.linalg.root, label: featureLabels.linalg.ja },
		children: [
			{ key: "linalg.unary", href: routes.linalg.unary, label: "単項演算" },
			{ key: "linalg.binary", href: routes.linalg.binary, label: "二項演算" },
			{ key: "linalg.vector", href: routes.linalg.vector, label: "ベクトル演算" },
		],
	},
	{
		key: "coding",
		item: { key: "coding", href: routes.coding.root, label: featureLabels.coding.ja },
		children: [
			{ key: "coding.source", href: routes.coding.source, label: featureLabels.codingSource.ja },
			{ key: "coding.channel", href: routes.coding.channel, label: featureLabels.codingChannel.ja },
			{ key: "coding.gf2", href: routes.coding.gf2, label: featureLabels.codingGf2.ja },
			{ key: "coding.comm", href: routes.coding.comm, label: featureLabels.codingComm.ja },
		],
	},
	{
		key: "finiteField",
		item: { key: "finiteField", href: routes.finiteField.root, label: featureLabels.finiteField.ja },
		children: [
			{ key: "finiteField.gfp5", href: routes.finiteField.gfp5, label: "GF(5) 演算" },
			{ key: "finiteField.gf256", href: routes.finiteField.gf256, label: "GF(256) 演算" },
		],
	},
	{
		key: "concreteMath",
		item: { key: "concreteMath", href: routes.concreteMath.root, label: featureLabels.concreteMath.ja },
		children: [
			{ key: "concreteMath.recurrence", href: routes.concreteMath.recurrence, label: "漸化式" },
			{ key: "concreteMath.finiteCalculus", href: routes.concreteMath.finiteCalculus, label: "有限差分" },
			{ key: "concreteMath.summation", href: routes.concreteMath.summation, label: "総和" },
			{ key: "concreteMath.numberTheory", href: routes.concreteMath.numberTheory, label: "数論" },
			{ key: "concreteMath.specialFunctions", href: routes.concreteMath.specialFunctions, label: "特殊関数" },
		],
	},
	{
		key: "statistics",
		item: { key: "statistics", href: routes.statistics.root, label: featureLabels.statistics.ja },
		children: [
			{ key: "statistics.workshop", href: routes.statistics.workshop, label: "ワークショップ" },
			{ key: "statistics.testing", href: routes.statistics.testing, label: "仮説検定" },
			{ key: "statistics.distributions", href: routes.statistics.distributions, label: "確率分布" },
			{ key: "statistics.correlation", href: routes.statistics.correlation, label: "相関分析" },
			{ key: "statistics.gof", href: routes.statistics.gof, label: "適合度検定" },
			{ key: "statistics.regression", href: routes.statistics.regression, label: "回帰分析" },
		],
	},
];

export const AppMenu = () => {
	const pathname = usePathname();

	const currentSectionKey = useMemo(() => {
		for (const section of sections) {
			if (pathname === section.item.href || pathname.startsWith(`${section.item.href}/`)) {
				return section.key;
			}
			if (section.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))) {
				return section.key;
			}
		}
		return null;
	}, [pathname]);

	const [open, setOpen] = useState(false);
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
		const entries = sections
			.filter((section) => section.children && section.children.length > 0)
			.map((section) => {
				const isCurrent = currentSectionKey === section.key;
				return [section.key, isCurrent] as const;
			});
		return Object.fromEntries(entries);
	});

	useEffect(() => {
		if (!currentSectionKey) return;
		setExpandedSections((prev) => ({
			...prev,
			[currentSectionKey]: true,
		}));
	}, [currentSectionKey]);

	const toggleSection = (sectionKey: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionKey]: !prev[sectionKey],
		}));
	};

	return (
		<>
			<IconButton onClick={() => setOpen(true)}>
				<MenuIcon className="h-5 w-5" />
			</IconButton>

			<Drawer open={open} title="Menu" onClose={() => setOpen(false)}>
				<Stack gap={"lg"}>
					<Stack gap={"md"}>
						{sections.map((section) => (
							<Stack key={section.key} gap={"xs"}>
								<Flex align="center" justify="between" className="gap-2">
									<LinkText
										href={section.item.href}
										onClick={() => setOpen(false)}
										className="font-semibold text-foreground/85 hover:underline"
									>
										{section.item.label}
									</LinkText>

									{section.children && section.children.length > 0 ? (
										<IconButton
											type="button"
											size="sm"
											variant="ghost"
											color="secondary"
											onClick={() => toggleSection(section.key)}
											aria-label={expandedSections[section.key] ? `${section.item.label} を折りたたむ` : `${section.item.label} を展開する`}
										>
											{expandedSections[section.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
										</IconButton>
									) : null}
								</Flex>

								{section.children && section.children.length > 0 && expandedSections[section.key] ? (
									<Stack gap={"xs"} className="ml-2 border-l border-slate-200 dark:border-slate-700 pl-3">
										{section.children.map((child) => (
											<LinkText
												key={child.key}
												href={child.href}
												onClick={() => setOpen(false)}
												className="font-normal text-muted-foreground hover:underline"
											>
												{child.label}
											</LinkText>
										))}
									</Stack>
								) : null}
							</Stack>
						))}
					</Stack>

					<Stack direction="row">
						<Text color={"muted"}>
							Escで閉じます
						</Text>
					</Stack>
				</Stack>
			</Drawer>
		</>
	);
};
