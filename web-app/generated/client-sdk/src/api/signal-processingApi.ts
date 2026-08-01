/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (signal-processing) ---

import * as W from "../wrappers/signal-processing";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.

export type WavInfoDTO = W.WavInfoDto;

export type SignalDTO = W.SignalDto;

export type SpectrumDTO = W.SpectrumDto;

export type SignalProcessingApiDTO = W.SignalProcessingApiDto;

export type AdaptiveFilterLMSDTO = W.AdaptiveFilterLMSDto;

export type AdaptiveFilterNLMSDTO = W.AdaptiveFilterNLMSDto;

export type SeriesDTO = W.SeriesDto;

export type IIRFilterDTO = W.IIRFilterDto;

export type AnalogFilterSpecDTO = W.AnalogFilterSpecDto;

export type DigitalFilterSpecDTO = W.DigitalFilterSpecDto;

export type BorderDTO = W.BorderDto;

export type KernelDTO = W.KernelDto;

export type ImageDTO = W.ImageDto;

export type WindowTypeDTO = W.WindowTypeDto;

export type FIRFilterDTO = W.FIRFilterDto;


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


export class WavInfo {
  private readonly _dto: WavInfoDTO;

  private constructor(dto: WavInfoDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: WavInfoDTO) {
    return new WavInfo(dto);
  }

  toDTO(): WavInfoDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Signal {
  private readonly _dto: SignalDTO;

  private constructor(dto: SignalDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SignalDTO) {
    return new Signal(dto);
  }

  toDTO(): SignalDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Spectrum {
  private readonly _dto: SpectrumDTO;

  private constructor(dto: SpectrumDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SpectrumDTO) {
    return new Spectrum(dto);
  }

  toDTO(): SpectrumDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class SignalProcessingApi {
  private readonly _dto: SignalProcessingApiDTO;

  private constructor(dto: SignalProcessingApiDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SignalProcessingApiDTO) {
    return new SignalProcessingApi(dto);
  }

  toDTO(): SignalProcessingApiDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class AdaptiveFilterLMS {
  private readonly _dto: AdaptiveFilterLMSDTO;

  private constructor(dto: AdaptiveFilterLMSDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: AdaptiveFilterLMSDTO) {
    return new AdaptiveFilterLMS(dto);
  }

  toDTO(): AdaptiveFilterLMSDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class AdaptiveFilterNLMS {
  private readonly _dto: AdaptiveFilterNLMSDTO;

  private constructor(dto: AdaptiveFilterNLMSDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: AdaptiveFilterNLMSDTO) {
    return new AdaptiveFilterNLMS(dto);
  }

  toDTO(): AdaptiveFilterNLMSDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Series {
  private readonly _dto: SeriesDTO;

  private constructor(dto: SeriesDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: SeriesDTO) {
    return new Series(dto);
  }

  toDTO(): SeriesDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class IIRFilter {
  private readonly _dto: IIRFilterDTO;

  private constructor(dto: IIRFilterDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: IIRFilterDTO) {
    return new IIRFilter(dto);
  }

  toDTO(): IIRFilterDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class AnalogFilterSpec {
  private readonly _dto: AnalogFilterSpecDTO;

  private constructor(dto: AnalogFilterSpecDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: AnalogFilterSpecDTO) {
    return new AnalogFilterSpec(dto);
  }

  toDTO(): AnalogFilterSpecDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class DigitalFilterSpec {
  private readonly _dto: DigitalFilterSpecDTO;

  private constructor(dto: DigitalFilterSpecDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: DigitalFilterSpecDTO) {
    return new DigitalFilterSpec(dto);
  }

  toDTO(): DigitalFilterSpecDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Border {
  private readonly _dto: BorderDTO;

  private constructor(dto: BorderDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: BorderDTO) {
    return new Border(dto);
  }

  toDTO(): BorderDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Kernel {
  private readonly _dto: KernelDTO;

  private constructor(dto: KernelDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: KernelDTO) {
    return new Kernel(dto);
  }

  toDTO(): KernelDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class Image {
  private readonly _dto: ImageDTO;

  private constructor(dto: ImageDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: ImageDTO) {
    return new Image(dto);
  }

  toDTO(): ImageDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class WindowType {
  private readonly _dto: WindowTypeDTO;

  private constructor(dto: WindowTypeDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: WindowTypeDTO) {
    return new WindowType(dto);
  }

  toDTO(): WindowTypeDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

export class FIRFilter {
  private readonly _dto: FIRFilterDTO;

  private constructor(dto: FIRFilterDTO) {
    this._dto = dto;
  }

  static fromDTO(dto: FIRFilterDTO) {
    return new FIRFilter(dto);
  }

  toDTO(): FIRFilterDTO {
    return this._dto;
  }

  toString(): string {

    return JSON.stringify(this._dto);

  }




}

