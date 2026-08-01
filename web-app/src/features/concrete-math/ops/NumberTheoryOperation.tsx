"use client";
import { Stack } from "../../../design/primitives/Stack";
import { useState } from "react";
import { Text } from "../../../design/baseComponents/Text";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { View } from "../../../design/primitives/View";
import { Button } from "../../../design/baseComponents/Button";
import { Input } from "../../../design/baseComponents/Input";
import { Flex } from "../../../design/primitives/Flex";
import { ConcreteMathHelper } from "@my-project/client-sdk/api/concreteMath";

export const NumberTheoryOperation = () => {
    // GCD / LCM
    const [gcdA, setGcdA] = useState<string>("48");
    const [gcdB, setGcdB] = useState<string>("18");
    const [gcdRes, setGcdRes] = useState<{ gcd: string; lcm: string; x: string; y: string } | null>(null);

    // Primes
    const [primeN, setPrimeN] = useState<string>("60324835252721");
    const [primeRes, setPrimeRes] = useState<{ isPrime: boolean; factors: { p: string; exp: number }[]; phi: string } | null>(null);

    // Modular
    const [modBase, setModBase] = useState<string>("3");
    const [modExp, setModExp] = useState<string>("10");
    const [modM, setModM] = useState<string>("11");
    const [modPowRes, setModPowRes] = useState<string | null>(null);
    const [modInvRes, setModInvRes] = useState<string | null>(null);

    const [busy, setBusy] = useState(false);

    async function onCalculateGcd() {
        setBusy(true);
        try {
            const g = await ConcreteMathHelper.ntGcd(gcdA, gcdB);
            const l = await ConcreteMathHelper.ntLcm(gcdA, gcdB);
            const ext = await ConcreteMathHelper.ntExtendedGcd(gcdA, gcdB);
            setGcdRes({ gcd: g, lcm: l, x: ext.x, y: ext.y });
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    async function onCalculatePrimes() {
        setBusy(true);
        try {
            const isP = await ConcreteMathHelper.ntIsPrime(primeN);
            const { factors } = await ConcreteMathHelper.ntFactorize(primeN);
            const phi = await ConcreteMathHelper.ntPhi(primeN);
            setPrimeRes({ isPrime: isP, factors, phi });
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    async function onCalculateMod() {
        setBusy(true);
        try {
            const pow = await ConcreteMathHelper.ntModPow(modBase, modExp, modM);
            setModPowRes(pow);
            try {
                const inv = await ConcreteMathHelper.ntModInverse(modBase, modM);
                setModInvRes(inv);
            } catch {
                setModInvRes("N/A (not coprime)");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Stack gap="xl">
            {/* GCD / LCM Section */}
            <View bg="muted" padding="lg" rounded="lg" className="border">
                <Text weight="bold" variant="body" className="mb-3">最大公約数・最小公倍数 (GCD / LCM)</Text>
                <Stack gap="md">
                    <Flex gap="md" align="end" wrap={true}>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">整数 a</Text>
                            <Input value={gcdA} onChange={(e) => setGcdA(e.target.value)} placeholder="例: 48" />
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">整数 b</Text>
                            <Input value={gcdB} onChange={(e) => setGcdB(e.target.value)} placeholder="例: 18" />
                        </Stack>
                        <Button onClick={onCalculateGcd} loading={busy}>計算</Button>
                    </Flex>
                    {gcdRes && (
                        <View bg="card" padding="md" rounded="md" className="border border-slate-200">
                            <Stack gap="sm">
                                <Flex justify="between">
                                    <Text variant="detail" color="secondary">GCD({gcdA}, {gcdB})</Text>
                                    <Text variant="h2" weight="bold" color="primary">{gcdRes.gcd}</Text>
                                </Flex>
                                <Flex justify="between">
                                    <Text variant="detail" color="secondary">LCM({gcdA}, {gcdB})</Text>
                                    <Text variant="h2" weight="bold" color="primary" className="text-right overflow-hidden text-ellipsis">{gcdRes.lcm}</Text>
                                </Flex>
                                <View className="mt-2 pt-2 border-t">
                                    <Text variant="detail" color="secondary">ベズーの等式 (Bézout&apos;s identity)</Text>
                                    <View className="bg-slate-50 dark:bg-slate-900 p-2 rounded mt-1 font-mono text-sm overflow-x-auto">
                                        {gcdA}({gcdRes.x}) + {gcdB}({gcdRes.y}) = {gcdRes.gcd}
                                    </View>
                                </View>
                            </Stack>
                        </View>
                    )}
                </Stack>
            </View>

            {/* Primes Section */}
            <View bg="muted" padding="lg" rounded="lg" className="border">
                <Text weight="bold" variant="body" className="mb-3">素数・素因数分解 (Primes & Factorization)</Text>
                <Stack gap="md">
                    <Flex gap="md" align="end" wrap={true}>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">整数 n (巨大整数可)</Text>
                            <Input value={primeN} onChange={(e) => setPrimeN(e.target.value)} placeholder="例: 60" className="w-80" />
                        </Stack>
                        <Button onClick={onCalculatePrimes} loading={busy}>解析</Button>
                    </Flex>
                    {primeRes && (
                        <View bg="card" padding="md" rounded="md" className="border border-slate-200">
                            <Stack gap="md">
                                <Flex justify="between">
                                    <Text variant="detail" color="secondary">判定</Text>
                                    <Text variant="h3" weight="bold" color={primeRes.isPrime ? "primary" : "secondary"}>
                                        {primeRes.isPrime ? "素数 (Prime)" : "合成数 (Composite)"}
                                    </Text>
                                </Flex>
                                <View>
                                    <Text variant="detail" color="secondary" className="mb-1">素因数分解</Text>
                                    <View className="bg-slate-50 dark:bg-slate-900 p-3 rounded font-mono text-lg overflow-x-auto">
                                        <Markdown>{`$${primeN} = ${primeRes.factors
                                            .map((f) => (f.exp > 1 ? `${f.p}^{${f.exp}}` : f.p))
											.join(" \\times ")}$`}</Markdown>
                                    </View>
                                </View>
                                <Flex justify="between">
                                    <Text variant="detail" color="secondary">オイラーのφ関数 (φ({primeN}))</Text>
                                    <Text variant="h3" weight="bold" className="text-right overflow-hidden text-ellipsis">{primeRes.phi}</Text>
                                </Flex>
                            </Stack>
                        </View>
                    )}
                </Stack>
            </View>

            {/* Modular Section */}
            <View bg="muted" padding="lg" rounded="lg" className="border">
                <Text weight="bold" variant="body" className="mb-3">剰余演算 (Modular Arithmetic)</Text>
                <Stack gap="md">
                    <Flex gap="md" align="end" wrap={true}>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">底 a</Text>
                            <Input value={modBase} onChange={(e) => setModBase(e.target.value)} className="w-24" />
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">指数 e</Text>
                            <Input value={modExp} onChange={(e) => setModExp(e.target.value)} className="w-24" />
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" weight="semibold" color="secondary">法 m</Text>
                            <Input value={modM} onChange={(e) => setModM(e.target.value)} className="w-24" />
                        </Stack>
                        <Button onClick={onCalculateMod} loading={busy}>計算</Button>
                    </Flex>
                    {(modPowRes !== null || modInvRes !== null) && (
                        <View bg="card" padding="md" rounded="md" className="border border-slate-200">
                            <Stack gap="sm">
                                <Flex justify="between">
                                    <Text variant="detail" color="secondary">{modBase}<sup>{modExp}</sup> mod {modM}</Text>
                                    <Text variant="h2" weight="bold" color="primary">{modPowRes}</Text>
                                </Flex>
                                <Flex justify="between">
                                    <Text variant="detail" color="secondary">{modBase}⁻¹ mod {modM} (逆元)</Text>
                                    <Text variant="h3" weight="bold">{modInvRes}</Text>
                                </Flex>
                            </Stack>
                        </View>
                    )}
                </Stack>
            </View>
        </Stack>
    );
};
