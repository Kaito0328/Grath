"use client";

import { CorrelationLab } from "../../../features/statistics/components/CorrelationLab";
import { View } from "../../../design/primitives/View";

export default function CorrelationPage() {
  return (
    <View padding="xl" className="min-h-screen bg-canvas">
      <CorrelationLab />
    </View>
  );
}
