import * as W from "../wrappers/sourceCoding";
import { withReady } from "./runtime";

export type SourceCodingCodec = "huffman" | "lz78" | "arithmetic";

export class SourceCodingApi {
	static async encodeHex(codec: SourceCodingCodec, input: string): Promise<string> {
		return await withReady(() => {
			switch (codec) {
				case "huffman":
					return W.huffmanEncodeHex(input);
				case "lz78":
					return W.lz78EncodeHex(input);
				case "arithmetic":
					return W.arithmeticEncodeHex(input);
			}
		});
	}

	static async decodeHex(codec: SourceCodingCodec, hex: string): Promise<string> {
		return await withReady(() => {
			switch (codec) {
				case "huffman":
					return W.huffmanDecodeHex(hex);
				case "lz78":
					return W.lz78DecodeHex(hex);
				case "arithmetic":
					return W.arithmeticDecodeHex(hex);
			}
		});
	}
}
