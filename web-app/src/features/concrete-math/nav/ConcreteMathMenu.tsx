"use client";
import { LinkText } from "../../../design/baseComponents/LinkText";
import { Stack } from "../../../design/primitives/Stack";
import { routes } from "../../../config/routes";
import { usePathname } from "next/navigation";

export const ConcreteMathMenu = () => {
    const pathname = usePathname();

    const items = [
        { href: routes.concreteMath.root, label: "概要" },
        { href: routes.concreteMath.recurrence, label: "線形漸化式" },
        { href: routes.concreteMath.finiteCalculus, label: "有限差分・和分" },
        { href: routes.concreteMath.summation, label: "数列の和と特殊な数" },
        { href: routes.concreteMath.numberTheory, label: "初等整数論" },
        { href: routes.concreteMath.specialFunctions, label: "特殊関数" },
    ];

    return (
        <Stack gap={"sm"}>
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <LinkText
                        key={item.href}
                        href={item.href}
                        className={isActive ? "font-bold text-foreground" : "font-normal text-muted-foreground"}
                    >
                        {item.label}
                    </LinkText>
                );
            })}
        </Stack>
    );
};
