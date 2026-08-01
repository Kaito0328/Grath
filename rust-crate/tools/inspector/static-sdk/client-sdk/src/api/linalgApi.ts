// @ts-nocheck
/* eslint-disable */
/* tslint:disable */

import * as W from "../wrappers/linalg";
import { withReady } from "./runtime";

export class LinalgApi {
    static async addNumeric(a: string, b: string): Promise<string> {
        return await withReady(() => W.addNumeric(a, b));
    }

    static async addRational(a: string, b: string): Promise<string> {
        return await withReady(() => W.addRational(a, b));
    }

    static async addSymbolic(a: string, b: string): Promise<string> {
        return await withReady(() => W.addSymbolic(a, b));
    }

    static async mulNumeric(a: string, b: string): Promise<string> {
        return await withReady(() => W.mulNumeric(a, b));
    }

    static async mulRational(a: string, b: string): Promise<string> {
        return await withReady(() => W.mulRational(a, b));
    }

    static async mulSymbolic(a: string, b: string): Promise<string> {
        return await withReady(() => W.mulSymbolic(a, b));
    }

    static async invNumeric(a: string): Promise<string> {
        return await withReady(() => W.invNumeric(a));
    }

    static async invRational(a: string): Promise<string> {
        return await withReady(() => W.invRational(a));
    }

    static async invSymbolic(a: string): Promise<string> {
        return await withReady(() => W.invSymbolic(a));
    }

    static async luNumeric(a: string): Promise<string> {
        return await withReady(() => W.luNumeric(a));
    }

    static async luRational(a: string): Promise<string> {
        return await withReady(() => W.luRational(a));
    }

    static async luSymbolic(a: string): Promise<string> {
        return await withReady(() => W.luSymbolic(a));
    }

    static async qrNumeric(a: string): Promise<string> {
        return await withReady(() => W.qrNumeric(a));
    }

    static async qrRational(a: string): Promise<string> {
        return await withReady(() => W.qrRational(a));
    }

    static async qrSymbolic(a: string): Promise<string> {
        return await withReady(() => W.qrSymbolic(a));
    }

    static async svdNumeric(a: string): Promise<string> {
        return await withReady(() => W.svdNumeric(a));
    }

    static async svdRational(a: string): Promise<string> {
        return await withReady(() => W.svdRational(a));
    }

    static async svdSymbolic(a: string): Promise<string> {
        return await withReady(() => W.svdSymbolic(a));
    }

    static async eigenvaluesNumeric(a: string): Promise<string> {
        return await withReady(() => W.eigenvaluesNumeric(a));
    }

    static async eigenvaluesRational(a: string): Promise<string> {
        return await withReady(() => W.eigenvaluesRational(a));
    }

    static async eigenvaluesSymbolic(a: string): Promise<string> {
        return await withReady(() => W.eigenvaluesSymbolic(a));
    }

    static async mulVectorNumeric(aCsv: string, vCsv: string): Promise<string> {
        return await withReady(() => W.mulVectorNumeric(aCsv, vCsv));
    }

    static async mulVectorRational(aCsv: string, vCsv: string): Promise<string> {
        return await withReady(() => W.mulVectorRational(aCsv, vCsv));
    }

    static async mulVectorSymbolic(aCsv: string, vCsv: string): Promise<string> {
        return await withReady(() => W.mulVectorSymbolic(aCsv, vCsv));
    }

    static async solveVectorNumeric(aCsv: string, bCsv: string): Promise<string> {
        return await withReady(() => W.solveVectorNumeric(aCsv, bCsv));
    }

    static async solveVectorRational(aCsv: string, bCsv: string): Promise<string> {
        return await withReady(() => W.solveVectorRational(aCsv, bCsv));
    }

    static async solveVectorSymbolic(aCsv: string, bCsv: string): Promise<string> {
        return await withReady(() => W.solveVectorSymbolic(aCsv, bCsv));
    }

    static async mulSymbolicComplex(a: string, b: string): Promise<string> {
        return await withReady(() => W.mulSymbolicComplex(a, b));
    }

    static async conjTransposeSymbolic(a: string): Promise<string> {
        return await withReady(() => W.conjTransposeSymbolic(a));
    }
}
