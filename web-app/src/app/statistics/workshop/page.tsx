"use client";

import React from "react";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { StatisticsWorkshop } from "../../../features/statistics/components/StatisticsWorkshop";
import { routes } from "../../../config/routes";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function StatisticsWorkshopPage() {
    return (
        <View padding="xl">
            <Stack gap="xl">
                <Stack direction="row" gap="xs" className="items-center text-slate-500">
                    <Link href={routes.statistics.root} className="hover:text-brand-primary transition-colors">
                        Statistics
                    </Link>
                    <ChevronRight size={14} />
                    <Text color="secondary">Workshop</Text>
                </Stack>

                <StatisticsWorkshop />
            </Stack>
        </View>
    );
}
