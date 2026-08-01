/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (source-coding) ---

import * as W from "../wrappers/source-coding";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.

export type JonesCodeDTO = W.JonesCodeDto;

export type SymbolPrDTO = W.SymbolPrDto;

export type SymbolRangeDTO = W.SymbolRangeDto;

export type ArithmeticCodeDTO = W.ArithmeticCodeDto;

export type MarkovDTO = W.MarkovDto;

export type HuffmanCodeDTO = W.HuffmanCodeDto;

export type Lz78CodeDTO = W.Lz78CodeDto;

export type SourceCodingApiDTO = W.SourceCodingApiDto;

export type SymbolsPrDTO = W.SymbolsPrDto;

export type BlockHuffmanTreeDTO = W.BlockHuffmanTreeDto;


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


export class JonesCode {
  private readonly _dto: JonesCodeDTO;

  private constructor(dto: JonesCodeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: JonesCodeDTO) {
    return new JonesCode(dto);
  }

  toDTO(): JonesCodeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class SymbolPr {
  private readonly _dto: SymbolPrDTO;

  private constructor(dto: SymbolPrDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SymbolPrDTO) {
    return new SymbolPr(dto);
  }

  toDTO(): SymbolPrDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class SymbolRange {
  private readonly _dto: SymbolRangeDTO;

  private constructor(dto: SymbolRangeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SymbolRangeDTO) {
    return new SymbolRange(dto);
  }

  toDTO(): SymbolRangeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class ArithmeticCode {
  private readonly _dto: ArithmeticCodeDTO;

  private constructor(dto: ArithmeticCodeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: ArithmeticCodeDTO) {
    return new ArithmeticCode(dto);
  }

  toDTO(): ArithmeticCodeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Markov {
  private readonly _dto: MarkovDTO;

  private constructor(dto: MarkovDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: MarkovDTO) {
    return new Markov(dto);
  }

  toDTO(): MarkovDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class HuffmanCode {
  private readonly _dto: HuffmanCodeDTO;

  private constructor(dto: HuffmanCodeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: HuffmanCodeDTO) {
    return new HuffmanCode(dto);
  }

  toDTO(): HuffmanCodeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Lz78Code {
  private readonly _dto: Lz78CodeDTO;

  private constructor(dto: Lz78CodeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: Lz78CodeDTO) {
    return new Lz78Code(dto);
  }

  toDTO(): Lz78CodeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class SourceCodingApi {
  private readonly _dto: SourceCodingApiDTO;

  private constructor(dto: SourceCodingApiDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SourceCodingApiDTO) {
    return new SourceCodingApi(dto);
  }

  toDTO(): SourceCodingApiDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class SymbolsPr {
  private readonly _dto: SymbolsPrDTO;

  private constructor(dto: SymbolsPrDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SymbolsPrDTO) {
    return new SymbolsPr(dto);
  }

  toDTO(): SymbolsPrDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class BlockHuffmanTree {
  private readonly _dto: BlockHuffmanTreeDTO;

  private constructor(dto: BlockHuffmanTreeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: BlockHuffmanTreeDTO) {
    return new BlockHuffmanTree(dto);
  }

  toDTO(): BlockHuffmanTreeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

