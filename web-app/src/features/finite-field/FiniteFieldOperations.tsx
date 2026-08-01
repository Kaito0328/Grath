"use client";

import { useEffect, useMemo, useState } from "react";
import { FiniteFieldApi } from "@my-project/client-sdk";
import { Copy as CopyIcon } from "lucide-react";
import { Button } from "../../design/baseComponents/Button";
import { FormField } from "../../design/baseComponents/FormField";
import { IconButton } from "../../design/baseComponents/IconButton";
import { Input } from "../../design/baseComponents/Input";
import { NumberInput } from "../../design/baseComponents/NumberInput";
import { Select } from "../../design/baseComponents/Select";
import { Spinner } from "../../design/baseComponents/Spinner";
import { Text } from "../../design/baseComponents/Text";
import { Stack } from "../../design/primitives/Stack";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { writeClipboardText } from "../../shared/clipboard/writeText";

type OpKey =
    | "gfp5_add"
    | "gfp5_mul"
    | "gfp5_inv"
    | "gf256_mul"
    | "gf256_inv_check";

const ops: Array<{ key: OpKey; label: string; arity: 1 | 2; desc: string }> = [
    { key: "gfp5_add", label: "GF(5) 加算", arity: 2, desc: "(a + b) mod 5" },
    { key: "gfp5_mul", label: "GF(5) 乗算", arity: 2, desc: "(a * b) mod 5" },
    { key: "gfp5_inv", label: "GF(5) 逆元", arity: 1, desc: "a^(-1) mod 5" },
    { key: "gf256_mul", label: "GF(256) 乗算", arity: 2, desc: "AES 既約多項式での乗算" },
    { key: "gf256_inv_check", label: "GF(256) 逆元チェック", arity: 1, desc: "a * a^(-1) = 1 を確認" },
];

const quickInputs: Record<OpKey, Array<{ label: string; a: number; b?: number }>> = {
    gfp5_add: [
        { label: "2 + 4", a: 2, b: 4 },
        { label: "4 + 4", a: 4, b: 4 },
    ],
    gfp5_mul: [
        { label: "2 * 3", a: 2, b: 3 },
        { label: "4 * 4", a: 4, b: 4 },
    ],
    gfp5_inv: [
        { label: "a = 2", a: 2 },
        { label: "a = 4", a: 4 },
    ],
    gf256_mul: [
        { label: "AES例 0x57 * 0x83", a: 0x57, b: 0x83 },
        { label: "0x13 * 0x11", a: 0x13, b: 0x11 },
    ],
    gf256_inv_check: [
        { label: "a = 0x53", a: 0x53 },
        { label: "a = 0xCA", a: 0xCA },
    ],
};

function toHexByte(value: number) {
    return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
}

export interface FiniteFieldOperationsProps {
    defaultOp?: OpKey;
    allowedOps?: OpKey[];
}

export const FiniteFieldOperations = ({ defaultOp = "gf256_mul", allowedOps }: FiniteFieldOperationsProps) => {
    const visibleOps = useMemo(
        () => (allowedOps && allowedOps.length > 0 ? ops.filter((entry) => allowedOps.includes(entry.key)) : ops),
        [allowedOps]
    );

    const [op, setOp] = useState<OpKey>(defaultOp);
    const selected = useMemo(
        () => visibleOps.find((candidate) => candidate.key === op) ?? visibleOps[0] ?? ops[0],
        [op, visibleOps]
    );

    const [a, setA] = useState<number>(0x57);
    const [b, setB] = useState<number>(0x83);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!visibleOps.some((entry) => entry.key === op) && visibleOps[0]) {
            setOp(visibleOps[0].key);
        }
    }, [op, visibleOps]);

    const activeOp = selected.key;
    const isGf256Op = activeOp === "gf256_mul" || activeOp === "gf256_inv_check";

    const resultText = useMemo(() => {
        if (result == null) {
            return "";
        }

        if (activeOp === "gf256_inv_check") {
            return `check: ${result}`;
        }

        const numeric = Number.parseInt(result, 10);
        if (Number.isFinite(numeric) && isGf256Op) {
            return `dec: ${numeric}\nhex: ${toHexByte(numeric)}`;
        }

        return `value: ${result}`;
    }, [activeOp, isGf256Op, result]);

    const applyQuickInput = (entry: { a: number; b?: number }) => {
        setA(entry.a);
        if (typeof entry.b === "number") {
            setB(entry.b);
        }
    };

    const run = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setCopied(false);

        try {
            if (!Number.isFinite(a)) {
                throw new Error("a が未入力です");
            }
            if (selected.arity === 2 && !Number.isFinite(b)) {
                throw new Error("b が未入力です");
            }

            switch (activeOp) {
                case "gfp5_add": {
                    const out = await FiniteFieldApi.gfp5Add(a, b);
                    setResult(String(out));
                    return;
                }
                case "gfp5_mul": {
                    const out = await FiniteFieldApi.gfp5Mul(a, b);
                    setResult(String(out));
                    return;
                }
                case "gfp5_inv": {
                    const out = await FiniteFieldApi.gfp5Inv(a);
                    setResult(String(out));
                    return;
                }
                case "gf256_mul": {
                    const out = await FiniteFieldApi.gf256Mul(a, b);
                    setResult(String(out));
                    return;
                }
                case "gf256_inv_check": {
                    const ok = await FiniteFieldApi.gf256InvCheck(a);
                    setResult(String(ok));
                    return;
                }
            }
        } catch (runError) {
            setError(runError instanceof Error ? runError.message : String(runError));
        } finally {
            setLoading(false);
        }
    };

    const onCopy = async () => {
        if (!resultText) {
            return;
        }
        await writeClipboardText(resultText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    const settingBlock = (
        <Stack gap="md">
            <FormField label="演算" description={selected.desc}>
                <Select
                    value={activeOp}
                    onChange={(event) => setOp(event.target.value as OpKey)}
                    className="w-full sm:w-80"
                    options={visibleOps.map((entry) => ({ value: entry.key, label: entry.label }))}
                />
            </FormField>

            <Stack gap="sm">
                <Text variant="detail" weight="medium">
                    クイック入力
                </Text>
                <Stack direction="row" gap="sm" className="flex-wrap">
                    {quickInputs[activeOp].map((entry) => (
                        <Button
                            key={entry.label}
                            type="button"
                            size="sm"
                            variant="soft"
                            color="info"
                            onClick={() => applyQuickInput(entry)}
                        >
                            {entry.label}
                        </Button>
                    ))}
                </Stack>
            </Stack>
        </Stack>
    );

    const inputBlock = (
        <Stack direction="row" gap="sm" className="items-end flex-wrap">
            <FormField
                label={isGf256Op ? "a (0 - 255)" : "a (0 - 4)"}
                description={isGf256Op ? "10進数で入力してください" : "GF(5) では 0..4 を推奨"}
            >
                <NumberInput value={a} onChangeNumber={setA} allowFloat={false} min={0} max={isGf256Op ? 255 : 4} />
            </FormField>

            {selected.arity === 2 && (
                <FormField
                    label={isGf256Op ? "b (0 - 255)" : "b (0 - 4)"}
                    description={isGf256Op ? "10進数で入力してください" : "GF(5) では 0..4 を推奨"}
                >
                    <NumberInput value={b} onChangeNumber={setB} allowFloat={false} min={0} max={isGf256Op ? 255 : 4} />
                </FormField>
            )}
        </Stack>
    );

    const actionBlock = (
        <Stack gap="sm">
            <Button type="button" onClick={run} disabled={loading} className="w-full sm:w-auto">
                {loading ? <Spinner size="sm" /> : "実行"}
            </Button>
            {error && (
                <Text color="danger" variant="detail">
                    {error}
                </Text>
            )}
        </Stack>
    );

    const outputBlock = (
        <Stack gap="xs">
            <Stack direction="row" className="justify-between items-center">
                <Text color="muted">結果</Text>
                <IconButton onClick={onCopy} disabled={!resultText} title="コピー">
                    <CopyIcon className="h-5 w-5" />
                </IconButton>
            </Stack>
            <Input multeline rows={3} readOnly className="font-mono" value={resultText} placeholder="-" />
            {copied && (
                <Text variant="xs" color="muted">
                    コピーしました
                </Text>
            )}
        </Stack>
    );

    const verificationBlock =
        activeOp === "gf256_inv_check" && result != null ? (
            <Text color={result === "true" ? "success" : "danger"}>
                {result === "true"
                    ? "逆元チェックは成功しました (a * a^(-1) = 1)"
                    : "逆元チェックは失敗しました"}
            </Text>
        ) : undefined;

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
