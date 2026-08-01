/* eslint-disable */
/* tslint:disable */

import { requireTrimmed, withReady } from "./runtime";
import * as W from "../wrappers/algebraicDto";

export type RationalDTO = W.RationalDto;
export type SymbolicExprDTO = W.SymbolicExprDto;
export type SymbolicComplexDTO = W.SymbolicComplexDto;

export class AlgebraicDtoApi {
	async parseRationalDto(text: string): Promise<RationalDTO> {
		const trimmed = requireTrimmed(text, "Empty rational");
		return await withReady(() => W.rationalParseDto(trimmed));
	}

	async parseRationalDtoFromLatex(latex: string): Promise<RationalDTO> {
		const trimmed = requireTrimmed(latex, "Empty latex");
		return await withReady(() => W.rationalParseDtoFromLatex(trimmed));
	}

	async formatRationalDto(dto: RationalDTO): Promise<string> {
		return await withReady(() => W.rationalFormatDto(dto));
	}

	async formatRationalDtoToLatex(dto: RationalDTO): Promise<string> {
		return await withReady(() => W.rationalFormatDtoToLatex(dto));
	}

	async rationalSimplifyDto(dto: RationalDTO): Promise<RationalDTO> {
		return await withReady(() => W.rationalSimplifyDto(dto));
	}

	async rationalSimplifyDtoFromText(text: string): Promise<RationalDTO> {
		const trimmed = requireTrimmed(text, "Empty rational");
		return await withReady(() => W.rationalSimplifyDtoFromText(trimmed));
	}

	async parseSymbolicExprDto(text: string): Promise<SymbolicExprDTO> {
		const trimmed = requireTrimmed(text, "Empty expression");
		return await withReady(() => W.symbolicExprParseDto(trimmed));
	}

	async parseSymbolicExprDtoFromLatex(latex: string): Promise<SymbolicExprDTO> {
		const trimmed = requireTrimmed(latex, "Empty latex");
		return await withReady(() => W.symbolicExprParseDtoFromLatex(trimmed));
	}

	async formatSymbolicExprDto(dto: SymbolicExprDTO): Promise<string> {
		return await withReady(() => W.symbolicExprFormatDto(dto));
	}

	async formatSymbolicExprDtoToLatex(dto: SymbolicExprDTO): Promise<string> {
		return await withReady(() => W.symbolicExprFormatDtoToLatex(dto));
	}

	async symbolicExprSimplifyDto(dto: SymbolicExprDTO): Promise<SymbolicExprDTO> {
		return await withReady(() => W.symbolicExprSimplifyDto(dto));
	}

	async parseSymbolicComplexDto(text: string): Promise<SymbolicComplexDTO> {
		const trimmed = requireTrimmed(text, "Empty complex");
		return await withReady(() => W.symbolicComplexParseDto(trimmed));
	}

	async parseSymbolicComplexDtoFromLatex(latex: string): Promise<SymbolicComplexDTO> {
		const trimmed = requireTrimmed(latex, "Empty latex");
		return await withReady(() => W.symbolicComplexParseDtoFromLatex(trimmed));
	}

	async formatSymbolicComplexDto(dto: SymbolicComplexDTO): Promise<string> {
		return await withReady(() => W.symbolicComplexFormatDto(dto));
	}

	async formatSymbolicComplexDtoToLatex(dto: SymbolicComplexDTO): Promise<string> {
		return await withReady(() => W.symbolicComplexFormatDtoToLatex(dto));
	}

	async symbolicComplexSimplifyDto(dto: SymbolicComplexDTO): Promise<SymbolicComplexDTO> {
		return await withReady(() => W.symbolicComplexSimplifyDto(dto));
	}
}