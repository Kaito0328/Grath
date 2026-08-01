/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (finite-field) ---

import * as W from "../wrappers/finite-field";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.

export type FiniteFieldApiDTO = W.FiniteFieldApiDto;

export type FiniteField2mDTO = W.FiniteField2mDto;

export type GFExtDTO = W.GFExtDto;

export type GFExtStyleDTO = W.GFExtStyleDto;

export type GFExtDisplayDTO = W.GFExtDisplayDto;

export type GFpDTO = W.GFpDto;


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


export class FiniteFieldApi {
  private readonly _dto: FiniteFieldApiDTO;

  private constructor(dto: FiniteFieldApiDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: FiniteFieldApiDTO) {
    return new FiniteFieldApi(dto);
  }

  toDTO(): FiniteFieldApiDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class FiniteField2m {
  private readonly _dto: FiniteField2mDTO;

  private constructor(dto: FiniteField2mDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: FiniteField2mDTO) {
    return new FiniteField2m(dto);
  }

  toDTO(): FiniteField2mDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class GFExt {
  private readonly _dto: GFExtDTO;

  private constructor(dto: GFExtDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: GFExtDTO) {
    return new GFExt(dto);
  }

  toDTO(): GFExtDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class GFExtStyle {
  private readonly _dto: GFExtStyleDTO;

  private constructor(dto: GFExtStyleDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: GFExtStyleDTO) {
    return new GFExtStyle(dto);
  }

  toDTO(): GFExtStyleDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class GFExtDisplay {
  private readonly _dto: GFExtDisplayDTO;

  private constructor(dto: GFExtDisplayDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: GFExtDisplayDTO) {
    return new GFExtDisplay(dto);
  }

  toDTO(): GFExtDisplayDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class GFp {
  private readonly _dto: GFpDTO;

  private constructor(dto: GFpDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: GFpDTO) {
    return new GFp(dto);
  }

  toDTO(): GFpDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

