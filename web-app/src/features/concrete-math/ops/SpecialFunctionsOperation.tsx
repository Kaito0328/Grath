"use client";

import { useMemo, useState } from "react";
import { ConcreteMathHelper } from "@my-project/client-sdk/api/concreteMath";
import { Button } from "../../../design/baseComponents/Button";
import { FormField } from "../../../design/baseComponents/FormField";
import { Input } from "../../../design/baseComponents/Input";
import { NumberInput } from "../../../design/baseComponents/NumberInput";
import { Select } from "../../../design/baseComponents/Select";
import { Spinner } from "../../../design/baseComponents/Spinner";
import { Text } from "../../../design/baseComponents/Text";
import { Stack } from "../../../design/primitives/Stack";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { CopyIconButton } from "../../../shared/ui/CopyIconButton";

type SpecialMode = "gamma" | "beta" | "erf";

const modeOptions: Array<{ value: SpecialMode; label: string; description: string }> = [
    { value: "gamma", label: "Gamma Function", description: "Γ(z) を計算します。" },
    { value: "beta", label: "Beta Function", description: "B(x, y) を計算します。" },
    { value: "erf", label: "Error Function", description: "erf(z) を計算します。" },
];

function factorial(n: number): number {
    let out = 1;
    for (let i = 2; i <= n; i++) out *= i;
    return out;
}

function approxEqual(a: number, b: number, eps = 1e-9): boolean {
    return Math.abs(a - b) <= eps;
}

function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return String(value);
    return Number(value.toPrecision(12)).toString();
}

export const SpecialFunctionsOperation = () => {
    const [mode, setMode] = useState<SpecialMode>("gamma");
    const selectedMode = useMemo(() => modeOptions.find((entry) => entry.value === mode)!, [mode]);

    const [gammaZ, setGammaZ] = useState<number>(5);
    const [betaX, setBetaX] = useState<number>(2);
    const [betaY, setBetaY] = useState<number>(3);
    const [erfZ, setErfZ] = useState<number>(1);

    const [resultValue, setResultValue] = useState<number | null>(null);
    const [resultLabel, setResultLabel] = useState<string>("");
    const [verification, setVerification] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const run = async () => {
        setBusy(true);
        setError(null);
        setResultValue(null);
        setResultLabel("");
        setVerification(null);

        try {
            if (mode === "gamma") {
                const res = await ConcreteMathHelper.sfGamma(gammaZ);
                setResultValue(res);
                setResultLabel(`Γ(${gammaZ})`);

                if (Number.isInteger(gammaZ) && gammaZ >= 1 && gammaZ <= 12) {
                    const expected = factorial(gammaZ - 1);
                    setVerification(
                        approxEqual(res, expected)
                            ? `検証: Γ(${gammaZ}) = (${gammaZ} - 1)! = ${expected}`
                            : `検証: (${gammaZ} - 1)! = ${expected} ですが、計算値との差があります`,
                    );
                }
                return;
            }

            if (mode === "beta") {
                const res = await ConcreteMathHelper.sfBeta(betaX, betaY);
                setResultValue(res);
                setResultLabel(`B(${betaX}, ${betaY})`);

                if (betaX > 0 && betaY > 0) {
                    const gx = await ConcreteMathHelper.sfGamma(betaX);
                    const gy = await ConcreteMathHelper.sfGamma(betaY);
                    const gxy = await ConcreteMathHelper.sfGamma(betaX + betaY);
                    const expected = (gx * gy) / gxy;
                    setVerification(
                        approxEqual(res, expected)
                            ? `検証: B(x,y) = Γ(x)Γ(y)/Γ(x+y) が一致 (${formatNumber(expected)})`
                            : `検証: Γ(x)Γ(y)/Γ(x+y) = ${formatNumber(expected)}（近似差あり）`,
                    );
                }
                return;
            }

            const res = await ConcreteMathHelper.sfErf(erfZ);
            setResultValue(res);
            setResultLabel(`erf(${erfZ})`);

            const neg = await ConcreteMathHelper.sfErf(-erfZ);
            setVerification(
                approxEqual(neg, -res)
                    ? `検証: erf(-z) = -erf(z) が成立`
                    : `検証: erf(-z) = -erf(z) に近似差があります`,
            );
        } catch (runError) {
            setError(runError instanceof Error ? runError.message : String(runError));
        } finally {
            setBusy(false);
        }
    };

    const resultText = resultValue == null ? "" : formatNumber(resultValue);

    const settingBlock = (
        <Stack gap="md">
            <FormField label="関数" description={selectedMode.description}>
                <Select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as SpecialMode)}
                    className="w-full sm:w-72"
                    options={modeOptions.map((entry) => ({ value: entry.value, label: entry.label }))}
                />
            </FormField>

            <Stack direction="row" gap="sm" className="flex-wrap">
                <Button type="button" size="sm" variant="soft" color="info" onClick={() => { setMode("gamma"); setGammaZ(5); }}>
                    Gamma: z=5
                </Button>
                <Button type="button" size="sm" variant="soft" color="info" onClick={() => { setMode("beta"); setBetaX(2); setBetaY(3); }}>
                    Beta: x=2, y=3
                </Button>
                <Button type="button" size="sm" variant="soft" color="info" onClick={() => { setMode("erf"); setErfZ(1); }}>
                    Erf: z=1
                </Button>
            </Stack>
        </Stack>
    );

    const inputBlock = (
        <Stack direction="row" gap="sm" className="flex-wrap items-end">
            {mode === "gamma" && (
                <FormField label="z">
                    <NumberInput value={gammaZ} onChangeNumber={setGammaZ} className="w-40" />
                </FormField>
            )}

            {mode === "beta" && (
                <>
                    <FormField label="x">
                        <NumberInput value={betaX} onChangeNumber={setBetaX} className="w-40" />
                    </FormField>
                    <FormField label="y">
                        <NumberInput value={betaY} onChangeNumber={setBetaY} className="w-40" />
                    </FormField>
                </>
            )}

            {mode === "erf" && (
                <FormField label="z">
                    <NumberInput value={erfZ} onChangeNumber={setErfZ} className="w-40" />
                </FormField>
            )}
        </Stack>
    );

    const actionBlock = (
        <Stack gap="sm">
            <Button onClick={run} disabled={busy} className="w-full sm:w-auto">
                {busy ? <Spinner size="sm" /> : "計算"}
            </Button>
            {error && <Text color="danger">{error}</Text>}
        </Stack>
    );

    const outputBlock = (
        <Stack gap="sm">
            <Stack direction="row" className="items-center justify-between">
                <Text variant="detail" weight="semibold">{resultLabel || "結果"}</Text>
                <CopyIconButton text={resultText} disabled={!resultText} />
            </Stack>
            <Input multeline rows={2} readOnly value={resultText} className="font-mono" placeholder="-" />
        </Stack>
    );

    const verificationBlock = verification ? <Text color="muted">{verification}</Text> : undefined;

    return (
        <UnaryOperationLayout
            setting={settingBlock}
            input={inputBlock}
            action={actionBlock}
            output={outputBlock}
            verification={verificationBlock}
        />
    );
};
