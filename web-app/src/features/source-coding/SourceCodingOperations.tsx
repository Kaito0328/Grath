"use client";

import { useMemo, useState } from "react";
import { SourceCodingApi, type SourceCodingCodec } from "@my-project/client-sdk";
import { Button } from "../../design/baseComponents/Button";
import { FormField } from "../../design/baseComponents/FormField";
import { Input } from "../../design/baseComponents/Input";
import { Select } from "../../design/baseComponents/Select";
import { Spinner } from "../../design/baseComponents/Spinner";
import { Text } from "../../design/baseComponents/Text";
import { Flex } from "../../design/primitives/Flex";
import { Stack } from "../../design/primitives/Stack";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { CopyIconButton } from "../../shared/ui/CopyIconButton";
import { VariablePickerIconButton } from "../../shared/variable-manager/VariablePickerIconButton";
import { SaveVariableIconButton } from "../../shared/variable-manager/SaveVariableIconButton";
import { hexToBytes } from "../../shared/utils/hex";

type Mode = "encode" | "decode";

const tryHexByteLength = (hex: string): number | null => {
    try {
        const trimmed = hex.trim();
        if (trimmed.length === 0) return 0;
        return hexToBytes(trimmed).length;
    } catch {
        return null;
    }
};

const codecOptions: Array<{ value: SourceCodingCodec; label: string }> = [
    { value: "huffman", label: "Huffman" },
    { value: "lz78", label: "LZ78" },
    { value: "arithmetic", label: "Arithmetic" },
];

export const SourceCodingOperations = () => {
    const [codec, setCodec] = useState<SourceCodingCodec>("huffman");
    const [mode, setMode] = useState<Mode>("encode");

    const [inputText, setInputText] = useState<string>("hello hello hello");
    const [inputHex, setInputHex] = useState<string>("");

    const [encodeHex, setEncodeHex] = useState<string>("");
    const [decodeText, setDecodeText] = useState<string>("");
    const [roundTripText, setRoundTripText] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canRun = useMemo(() => {
        if (loading) return false;
        if (mode === "encode") return inputText.trim().length > 0;
        return inputHex.trim().length > 0;
    }, [loading, mode, inputText, inputHex]);

    const run = async () => {
        setLoading(true);
        setError(null);
        setEncodeHex("");
        setDecodeText("");
        setRoundTripText("");

        try {
            if (mode === "encode") {
                const outHex = await SourceCodingApi.encodeHex(codec, inputText);
                setEncodeHex(outHex);
                const roundTrip = await SourceCodingApi.decodeHex(codec, outHex);
                setRoundTripText(roundTrip);
                setDecodeText(roundTrip);
                return;
            }

            const outText = await SourceCodingApi.decodeHex(codec, inputHex);
            setDecodeText(outText);
        } catch (runError) {
            setError(runError instanceof Error ? runError.message : String(runError));
        } finally {
            setLoading(false);
        }
    };

    const settingBlock = (
        <Stack direction="row" gap="sm" className="items-end flex-wrap">
            <FormField label="方式">
                <Select
                    value={codec}
                    onChange={(e) => setCodec(e.target.value as SourceCodingCodec)}
                    className="w-48"
                    options={codecOptions}
                />
            </FormField>

            <FormField label="モード">
                <Select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as Mode)}
                    className="w-40"
                    options={[
                        { value: "encode", label: "Encode" },
                        { value: "decode", label: "Decode" },
                    ]}
                />
            </FormField>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="sm">
            {mode === "encode" ? (
                <Stack gap="sm">
                    <Flex align="center" justify="between">
                        <Text variant="detail" className="flex items-center gap-1">
                            入力テキスト
                            <Text span variant="detail" color="danger">*</Text>
                        </Text>
                        <Flex align="center" gap="xs">
                            <VariablePickerIconButton
                                kind="coding.source.text"
                                disabled={loading}
                                onPick={(entry) => setInputText(entry.value)}
                            />
                            <SaveVariableIconButton
                                kind="coding.source.text"
                                value={inputText}
                                suggestedName="S"
                                disabled={loading || inputText.trim().length === 0}
                            />
                            <CopyIconButton text={inputText} disabled={loading || inputText.trim().length === 0} />
                        </Flex>
                    </Flex>

                    <Text variant="xs" color="muted">
                        圧縮したいテキストを入力します。（bytes: {new TextEncoder().encode(inputText).length}）
                    </Text>

                    <Input
                        multeline
                        rows={6}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="text"
                        disabled={loading}
                    />
                </Stack>
            ) : (
                <Stack gap="sm">
                    <Flex align="center" justify="between">
                        <Text variant="detail" className="flex items-center gap-1">
                            入力hex
                            <Text span variant="detail" color="danger">*</Text>
                        </Text>
                        <Flex align="center" gap="xs">
                            <VariablePickerIconButton
                                kind="coding.source.hex"
                                disabled={loading}
                                onPick={(entry) => setInputHex(entry.value)}
                            />
                            <SaveVariableIconButton
                                kind="coding.source.hex"
                                value={inputHex}
                                suggestedName="hex"
                                disabled={loading || inputHex.trim().length === 0}
                            />
                            <CopyIconButton text={inputHex} disabled={loading || inputHex.trim().length === 0} />
                        </Flex>
                    </Flex>

                    <Text variant="xs" color="muted">
                        復号したい hex を入力します。
                        {(() => {
                            const len = tryHexByteLength(inputHex);
                            return len == null ? "" : `（bytes: ${len}）`;
                        })()}
                    </Text>

                    <Input
                        multeline
                        rows={6}
                        value={inputHex}
                        onChange={(e) => setInputHex(e.target.value)}
                        placeholder="e.g. 0a1b..."
                        disabled={loading}
                        className="font-mono"
                    />
                </Stack>
            )}
        </Stack>
    );

    const actionBlock = (
        <Stack gap="sm" align="start">
            <Button type="button" size="md" className="w-auto" onClick={run} disabled={!canRun}>
                {loading ? <Spinner size="sm" /> : "実行"}
            </Button>
            {error && <Text color="danger">{error}</Text>}
        </Stack>
    );

    const outputBlock = (
        <Stack gap="md">
            <Stack gap="sm">
                <Flex align="center" justify="between">
                    <Text variant="detail">Encode結果（hex）</Text>
                    <Flex align="center" gap="xs">
                        <SaveVariableIconButton
                            kind="coding.source.hex"
                            value={encodeHex}
                            suggestedName="encodedHex"
                            disabled={loading || encodeHex.trim().length === 0}
                        />
                        <CopyIconButton text={encodeHex} disabled={loading || encodeHex.trim().length === 0} />
                    </Flex>
                </Flex>
                <Input multeline rows={4} readOnly className="font-mono" value={encodeHex} placeholder="-" />
                <Text variant="xs" color="muted">
                    {(() => {
                        const len = tryHexByteLength(encodeHex);
                        return len == null ? "bytes: -" : `bytes: ${len}`;
                    })()}
                </Text>
            </Stack>

            {mode === "decode" && (
                <Stack gap="sm">
                    <Flex align="center" justify="between">
                        <Text variant="detail">Decode結果（text）</Text>
                        <Flex align="center" gap="xs">
                            <SaveVariableIconButton
                                kind="coding.source.text"
                                value={decodeText}
                                suggestedName="decodedText"
                                disabled={loading || decodeText.trim().length === 0}
                            />
                            <CopyIconButton text={decodeText} disabled={loading || decodeText.trim().length === 0} />
                        </Flex>
                    </Flex>
                    <Input multeline rows={6} readOnly value={decodeText} placeholder="-" />
                </Stack>
            )}
        </Stack>
    );

    const verificationBlock =
        mode === "encode" ? (
            <Stack gap="sm">
                <Stack gap="sm">
                    <Flex align="center" justify="between">
                        <Text variant="detail">元の文章 S</Text>
                        <Flex align="center" gap="xs">
                            <SaveVariableIconButton
                                kind="coding.source.text"
                                value={inputText}
                                suggestedName="S"
                                disabled={loading || inputText.trim().length === 0}
                            />
                            <CopyIconButton text={inputText} disabled={loading || inputText.trim().length === 0} />
                        </Flex>
                    </Flex>
                    <Input multeline rows={4} readOnly value={inputText} placeholder="-" />
                </Stack>

                <Stack gap="sm">
                    <Flex align="center" justify="between">
                        <Text variant="detail">Decode(Encode(S))</Text>
                        <Flex align="center" gap="xs">
                            <SaveVariableIconButton
                                kind="coding.source.text"
                                value={roundTripText}
                                suggestedName="roundTrip"
                                disabled={loading || roundTripText.trim().length === 0}
                            />
                            <CopyIconButton text={roundTripText} disabled={loading || roundTripText.trim().length === 0} />
                        </Flex>
                    </Flex>
                    <Input multeline rows={4} readOnly value={roundTripText} placeholder="-" />
                </Stack>
            </Stack>
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
