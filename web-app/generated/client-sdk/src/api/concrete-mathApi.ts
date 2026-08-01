/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (concrete-math) ---

import * as W from "../wrappers/concrete-math";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.

export type GeneralTermDTO = W.GeneralTermDto;

export type ClosedFormDTO = W.ClosedFormDto;

export type SeqStyleDTO = W.SeqStyleDto;

export type ClosedFormDisplayDTO = W.ClosedFormDisplayDto;

export type RecurrenceRelationDTO = W.RecurrenceRelationDto;

export type ConcreteMathApiDTO = W.ConcreteMathApiDto;


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


export class GeneralTerm {
  private readonly _dto: GeneralTermDTO;

  private constructor(dto: GeneralTermDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: GeneralTermDTO) {
    return new GeneralTerm(dto);
  }

  toDTO(): GeneralTermDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class ClosedForm {
  private readonly _dto: ClosedFormDTO;

  private constructor(dto: ClosedFormDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: ClosedFormDTO) {
    return new ClosedForm(dto);
  }

  toDTO(): ClosedFormDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class SeqStyle {
  private readonly _dto: SeqStyleDTO;

  private constructor(dto: SeqStyleDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SeqStyleDTO) {
    return new SeqStyle(dto);
  }

  toDTO(): SeqStyleDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class ClosedFormDisplay {
  private readonly _dto: ClosedFormDisplayDTO;

  private constructor(dto: ClosedFormDisplayDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: ClosedFormDisplayDTO) {
    return new ClosedFormDisplay(dto);
  }

  toDTO(): ClosedFormDisplayDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class RecurrenceRelation {
  private readonly _dto: RecurrenceRelationDTO;

  private constructor(dto: RecurrenceRelationDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: RecurrenceRelationDTO) {
    return new RecurrenceRelation(dto);
  }

  toDTO(): RecurrenceRelationDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class ConcreteMathApi {
  private readonly _dto: ConcreteMathApiDTO;

  private constructor(dto: ConcreteMathApiDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: ConcreteMathApiDTO) {
    return new ConcreteMathApi(dto);
  }

  toDTO(): ConcreteMathApiDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

