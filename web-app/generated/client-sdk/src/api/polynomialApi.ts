/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (polynomial) ---

import * as W from "../wrappers/polynomial";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.

export type PolynomialSolverDTO = W.PolynomialSolverDto;

export type PolynomialApiDTO = W.PolynomialApiDto;

export type PoleDTO = W.PoleDto;

export type PoleTermDTO = W.PoleTermDto;

export type PartialFractionExpansionDTO = W.PartialFractionExpansionDto;

export type RationalFunctionDTO = W.RationalFunctionDto;

export type PolynomialDTO = W.PolynomialDto;

export type RootMethodDTO = W.RootMethodDto;

export type RootDTO = W.RootDto;

export type PolyStyleDTO = W.PolyStyleDto;

export type PolyDisplayDTO = W.PolyDisplayDto;

export type RfDisplayDTO = W.RfDisplayDto;


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


export class PolynomialSolver {
  private readonly _dto: PolynomialSolverDTO;

  private constructor(dto: PolynomialSolverDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PolynomialSolverDTO) {
    return new PolynomialSolver(dto);
  }

  toDTO(): PolynomialSolverDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class PolynomialApi {
  private readonly _dto: PolynomialApiDTO;

  private constructor(dto: PolynomialApiDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PolynomialApiDTO) {
    return new PolynomialApi(dto);
  }

  toDTO(): PolynomialApiDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Pole {
  private readonly _dto: PoleDTO;

  private constructor(dto: PoleDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PoleDTO) {
    return new Pole(dto);
  }

  toDTO(): PoleDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class PoleTerm {
  private readonly _dto: PoleTermDTO;

  private constructor(dto: PoleTermDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PoleTermDTO) {
    return new PoleTerm(dto);
  }

  toDTO(): PoleTermDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class PartialFractionExpansion {
  private readonly _dto: PartialFractionExpansionDTO;

  private constructor(dto: PartialFractionExpansionDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PartialFractionExpansionDTO) {
    return new PartialFractionExpansion(dto);
  }

  toDTO(): PartialFractionExpansionDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class RationalFunction {
  private readonly _dto: RationalFunctionDTO;

  private constructor(dto: RationalFunctionDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: RationalFunctionDTO) {
    return new RationalFunction(dto);
  }

  toDTO(): RationalFunctionDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Polynomial {
  private readonly _dto: PolynomialDTO;

  private constructor(dto: PolynomialDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PolynomialDTO) {
    return new Polynomial(dto);
  }

  toDTO(): PolynomialDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class RootMethod {
  private readonly _dto: RootMethodDTO;

  private constructor(dto: RootMethodDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: RootMethodDTO) {
    return new RootMethod(dto);
  }

  toDTO(): RootMethodDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Root {
  private readonly _dto: RootDTO;

  private constructor(dto: RootDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: RootDTO) {
    return new Root(dto);
  }

  toDTO(): RootDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class PolyStyle {
  private readonly _dto: PolyStyleDTO;

  private constructor(dto: PolyStyleDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PolyStyleDTO) {
    return new PolyStyle(dto);
  }

  toDTO(): PolyStyleDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class PolyDisplay {
  private readonly _dto: PolyDisplayDTO;

  private constructor(dto: PolyDisplayDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: PolyDisplayDTO) {
    return new PolyDisplay(dto);
  }

  toDTO(): PolyDisplayDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class RfDisplay {
  private readonly _dto: RfDisplayDTO;

  private constructor(dto: RfDisplayDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: RfDisplayDTO) {
    return new RfDisplay(dto);
  }

  toDTO(): RfDisplayDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

