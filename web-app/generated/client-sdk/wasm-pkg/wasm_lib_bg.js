export class WasmAdaptiveFilterLMS {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmAdaptiveFilterLMS.prototype);
        obj.__wbg_ptr = ptr;
        WasmAdaptiveFilterLMSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAdaptiveFilterLMSFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmadaptivefilterlms_free(ptr, 0);
    }
    /**
     * @param {number} taps
     * @param {number} step_size
     * @returns {WasmAdaptiveFilterLMS}
     */
    static new(taps, step_size) {
        const ret = wasm.wasmadaptivefilterlms_new(taps, step_size);
        return WasmAdaptiveFilterLMS.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmadaptivefilterlms_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmAdaptiveFilterLMS.prototype[Symbol.dispose] = WasmAdaptiveFilterLMS.prototype.free;

export class WasmAdaptiveFilterNLMS {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmAdaptiveFilterNLMS.prototype);
        obj.__wbg_ptr = ptr;
        WasmAdaptiveFilterNLMSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAdaptiveFilterNLMSFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmadaptivefilternlms_free(ptr, 0);
    }
    /**
     * @param {number} taps
     * @param {number} step_size
     * @param {number} epsilon
     * @returns {WasmAdaptiveFilterNLMS}
     */
    static new(taps, step_size, epsilon) {
        const ret = wasm.wasmadaptivefilternlms_new(taps, step_size, epsilon);
        return WasmAdaptiveFilterNLMS.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmadaptivefilternlms_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Float64Array}
     */
    weights_vec() {
        const ret = wasm.wasmadaptivefilternlms_weights_vec(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}
if (Symbol.dispose) WasmAdaptiveFilterNLMS.prototype[Symbol.dispose] = WasmAdaptiveFilterNLMS.prototype.free;

export class WasmArithmeticCode {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmArithmeticCodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmarithmeticcode_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmarithmeticcode_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmArithmeticCode.prototype[Symbol.dispose] = WasmArithmeticCode.prototype.free;

export class WasmBCHCode {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmBCHCode.prototype);
        obj.__wbg_ptr = ptr;
        WasmBCHCodeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBCHCodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbchcode_free(ptr, 0);
    }
    /**
     * @param {number} m
     * @param {number} t
     * @returns {WasmBCHCode}
     */
    static new_auto(m, t) {
        const ret = wasm.wasmbchcode_new_auto(m, t);
        return WasmBCHCode.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmbchcode_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmBCHCode.prototype[Symbol.dispose] = WasmBCHCode.prototype.free;

export class WasmBernoulli {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmBernoulli.prototype);
        obj.__wbg_ptr = ptr;
        WasmBernoulliFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBernoulliFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbernoulli_free(ptr, 0);
    }
    /**
     * @param {number} p
     * @returns {WasmBernoulli}
     */
    static new(p) {
        const ret = wasm.wasmbernoulli_new(p);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmBernoulli.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmbernoulli_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmBernoulli.prototype[Symbol.dispose] = WasmBernoulli.prototype.free;

export class WasmBinomial {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmBinomial.prototype);
        obj.__wbg_ptr = ptr;
        WasmBinomialFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBinomialFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbinomial_free(ptr, 0);
    }
    /**
     * @param {bigint} n
     * @param {number} p
     * @returns {WasmBinomial}
     */
    static new(n, p) {
        const ret = wasm.wasmbinomial_new(n, p);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmBinomial.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmbinomial_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmBinomial.prototype[Symbol.dispose] = WasmBinomial.prototype.free;

export class WasmBlockHuffmanTree {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBlockHuffmanTreeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmblockhuffmantree_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmblockhuffmantree_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmBlockHuffmanTree.prototype[Symbol.dispose] = WasmBlockHuffmanTree.prototype.free;

export class WasmCategorical {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmCategorical.prototype);
        obj.__wbg_ptr = ptr;
        WasmCategoricalFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmCategoricalFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcategorical_free(ptr, 0);
    }
    /**
     * @param {Float64Array} probs
     * @returns {WasmCategorical}
     */
    static new(probs) {
        const ptr0 = passArrayF64ToWasm0(probs, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcategorical_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmCategorical.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmcategorical_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmCategorical.prototype[Symbol.dispose] = WasmCategorical.prototype.free;

export class WasmChiSquare {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmChiSquare.prototype);
        obj.__wbg_ptr = ptr;
        WasmChiSquareFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmChiSquareFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmchisquare_free(ptr, 0);
    }
    /**
     * @param {number} k
     * @returns {WasmChiSquare}
     */
    static new(k) {
        const ret = wasm.wasmchisquare_new(k);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmChiSquare.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmchisquare_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmChiSquare.prototype[Symbol.dispose] = WasmChiSquare.prototype.free;

export class WasmClosedForm {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmClosedForm.prototype);
        obj.__wbg_ptr = ptr;
        WasmClosedFormFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmClosedFormFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmclosedform_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    is_zero() {
        const ret = wasm.wasmclosedform_is_zero(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {WasmClosedForm}
     */
    simplified() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmclosedform_simplified(ptr);
        return WasmClosedForm.__wrap(ret);
    }
    simplify() {
        wasm.wasmclosedform_simplify(this.__wbg_ptr);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmclosedform_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmClosedForm}
     */
    static zero() {
        const ret = wasm.wasmclosedform_zero();
        return WasmClosedForm.__wrap(ret);
    }
}
if (Symbol.dispose) WasmClosedForm.prototype[Symbol.dispose] = WasmClosedForm.prototype.free;

export class WasmCodingApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmCodingApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcodingapi_free(ptr, 0);
    }
    /**
     * @param {number} m
     * @param {number} t
     * @param {Uint8Array} recv_bits
     * @returns {Uint8Array}
     */
    static bch_decode_bm(m, t, recv_bits) {
        const ptr0 = passArray8ToWasm0(recv_bits, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_bch_decode_bm(m, t, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @param {Uint8Array} recv_bits
     * @returns {Uint8Array}
     */
    static bch_decode_bm_with_g(n, g_bits, recv_bits) {
        const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(recv_bits, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_bch_decode_bm_with_g(n, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @param {Uint8Array} msg_bits
     * @returns {Uint8Array}
     */
    static bch_encode(n, g_bits, msg_bits) {
        const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(msg_bits, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_bch_encode(n, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @param {number} m
     * @param {number} t
     * @param {Uint8Array} msg_bits
     * @returns {Uint8Array}
     */
    static bch_encode_auto(m, t, msg_bits) {
        const ptr0 = passArray8ToWasm0(msg_bits, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_bch_encode_auto(m, t, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @param {number} m
     * @param {number} t
     * @returns {string}
     */
    static bch_new_auto_json(m, t) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmcodingapi_bch_new_auto_json(m, t);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @returns {string}
     */
    static bch_new_json(n, g_bits) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_bch_new_json(n, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @param {Uint8Array} recv_bits
     * @returns {Uint8Array}
     */
    static cyclic_decode_lut(n, g_bits, recv_bits) {
        const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(recv_bits, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_cyclic_decode_lut(n, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @param {Uint8Array} msg_bits
     * @returns {Uint8Array}
     */
    static cyclic_encode(n, g_bits, msg_bits) {
        const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(msg_bits, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_cyclic_encode(n, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @returns {string}
     */
    static cyclic_new_json(n, g_bits) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_cyclic_new_json(n, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @returns {string}
     */
    static gf2_cyclic_generator_matrix(n, g_bits) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_gf2_cyclic_generator_matrix(n, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {number} n
     * @param {Uint8Array} g_bits
     * @returns {string}
     */
    static gf2_cyclic_parity_check_matrix(n, g_bits) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passArray8ToWasm0(g_bits, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_gf2_cyclic_parity_check_matrix(n, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} g_csv
     * @returns {string}
     */
    static gf2_parity_check_from_generator_matrix(g_csv) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(g_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_gf2_parity_check_from_generator_matrix(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} h_csv
     * @param {string} r_bits
     * @returns {string}
     */
    static gf2_syndrome(h_csv, r_bits) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(h_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(r_bits, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_gf2_syndrome(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} bits4
     * @returns {string}
     */
    static hamming74_encode(bits4) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(bits4, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_hamming74_encode(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} bits4
     * @returns {number}
     */
    static hamming74_encode_len(bits4) {
        const ptr0 = passStringToWasm0(bits4, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_hamming74_encode_len(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {string} u0
     * @param {string} u1
     * @returns {string}
     */
    static linear_code_gf5_third(u0, u1) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(u0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(u1, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmcodingapi_linear_code_gf5_third(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {number} k
     * @param {number} n
     * @param {Uint8Array} recv
     * @param {Uint8Array} primitive_px
     * @returns {Uint8Array}
     */
    static reed_solomon_decode_bm(k, n, recv, primitive_px) {
        const ptr0 = passArray8ToWasm0(recv, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(primitive_px, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_reed_solomon_decode_bm(k, n, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @param {number} k
     * @param {number} n
     * @param {Uint8Array} msg
     * @param {Uint8Array} primitive_px
     * @returns {Uint8Array}
     */
    static reed_solomon_encode(k, n, msg, primitive_px) {
        const ptr0 = passArray8ToWasm0(msg, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(primitive_px, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmcodingapi_reed_solomon_encode(k, n, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmcodingapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmCodingApi.prototype[Symbol.dispose] = WasmCodingApi.prototype.free;

export class WasmConcreteMathApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmConcreteMathApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmconcretemathapi_free(ptr, 0);
    }
    /**
     * @param {number} n
     * @returns {number}
     */
    static get_bernoulli(n) {
        const ret = wasm.wasmconcretemathapi_get_bernoulli(n);
        return ret;
    }
    /**
     * @param {number} n
     * @returns {number}
     */
    static get_harmonic(n) {
        const ret = wasm.wasmconcretemathapi_get_harmonic(n);
        return ret;
    }
    /**
     * @param {number} n
     * @param {number} k
     * @returns {number}
     */
    static get_stirling1(n, k) {
        const ret = wasm.wasmconcretemathapi_get_stirling1(n, k);
        return ret;
    }
    /**
     * @param {number} n
     * @param {number} k
     * @returns {number}
     */
    static get_stirling2(n, k) {
        const ret = wasm.wasmconcretemathapi_get_stirling2(n, k);
        return ret;
    }
    /**
     * @param {bigint} a
     * @param {bigint} b
     * @returns {string}
     */
    static nt_extended_gcd(a, b) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmconcretemathapi_nt_extended_gcd(a, b);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} n
     * @returns {string}
     */
    static nt_factorize(n) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(n, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmconcretemathapi_nt_factorize(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {bigint} a
     * @param {bigint} b
     * @returns {bigint}
     */
    static nt_gcd(a, b) {
        const ret = wasm.wasmconcretemathapi_nt_gcd(a, b);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {string} n
     * @returns {boolean}
     */
    static nt_is_prime(n) {
        const ptr0 = passStringToWasm0(n, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmconcretemathapi_nt_is_prime(ptr0, len0);
        return ret !== 0;
    }
    /**
     * @param {bigint} a
     * @param {bigint} b
     * @returns {bigint}
     */
    static nt_lcm(a, b) {
        const ret = wasm.wasmconcretemathapi_nt_lcm(a, b);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} a
     * @param {bigint} m
     * @returns {bigint}
     */
    static nt_mod_inverse(a, m) {
        const ret = wasm.wasmconcretemathapi_nt_mod_inverse(a, m);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {bigint} base
     * @param {bigint} exp
     * @param {bigint} m
     * @returns {bigint}
     */
    static nt_mod_pow(base, exp, m) {
        const ret = wasm.wasmconcretemathapi_nt_mod_pow(base, exp, m);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} n
     * @returns {bigint}
     */
    static nt_phi(n) {
        const ret = wasm.wasmconcretemathapi_nt_phi(n);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    static sf_beta(x, y) {
        const ret = wasm.wasmconcretemathapi_sf_beta(x, y);
        return ret;
    }
    /**
     * @param {number} z
     * @returns {number}
     */
    static sf_erf(z) {
        const ret = wasm.wasmconcretemathapi_sf_erf(z);
        return ret;
    }
    /**
     * @param {number} z
     * @returns {number}
     */
    static sf_gamma(z) {
        const ret = wasm.wasmconcretemathapi_sf_gamma(z);
        return ret;
    }
    /**
     * @param {number} z
     * @returns {number}
     */
    static sf_log_gamma(z) {
        const ret = wasm.wasmconcretemathapi_sf_log_gamma(z);
        return ret;
    }
    /**
     * @param {number} s
     * @param {number} x
     * @returns {number}
     */
    static sf_regularized_gamma(s, x) {
        const ret = wasm.wasmconcretemathapi_sf_regularized_gamma(s, x);
        return ret;
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmconcretemathapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmConcreteMathApi.prototype[Symbol.dispose] = WasmConcreteMathApi.prototype.free;

export class WasmDirichlet {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDirichletFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdirichlet_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmdirichlet_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmDirichlet.prototype[Symbol.dispose] = WasmDirichlet.prototype.free;

export class WasmDtoFixtureApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDtoFixtureApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdtofixtureapi_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmdtofixtureapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmDtoFixtureApi.prototype[Symbol.dispose] = WasmDtoFixtureApi.prototype.free;

export class WasmExponential {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmExponential.prototype);
        obj.__wbg_ptr = ptr;
        WasmExponentialFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmExponentialFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmexponential_free(ptr, 0);
    }
    /**
     * @param {number} lambda
     * @returns {WasmExponential}
     */
    static new(lambda) {
        const ret = wasm.wasmexponential_new(lambda);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmExponential.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmexponential_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmExponential.prototype[Symbol.dispose] = WasmExponential.prototype.free;

export class WasmF {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmF.prototype);
        obj.__wbg_ptr = ptr;
        WasmFFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmf_free(ptr, 0);
    }
    /**
     * @param {number} m
     * @param {number} n
     * @returns {WasmF}
     */
    static new(m, n) {
        const ret = wasm.wasmf_new(m, n);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmF.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmf_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmF.prototype[Symbol.dispose] = WasmF.prototype.free;

export class WasmFIRFilter {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFIRFilter.prototype);
        obj.__wbg_ptr = ptr;
        WasmFIRFilterFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFIRFilterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfirfilter_free(ptr, 0);
    }
    /**
     * @param {WasmSignal} x
     * @returns {WasmSignal}
     */
    apply(x) {
        _assertClass(x, WasmSignal);
        const ret = wasm.wasmfirfilter_apply(this.__wbg_ptr, x.__wbg_ptr);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm.wasmfirfilter_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {Float64Array} coeffs
     * @returns {WasmFIRFilter}
     */
    static new_from_coeffs(coeffs) {
        const ptr0 = passArrayF64ToWasm0(coeffs, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmfirfilter_new_from_coeffs(ptr0, len0);
        return WasmFIRFilter.__wrap(ret);
    }
    /**
     * @param {Float64Array} coeffs
     * @param {number} fs
     * @returns {WasmFIRFilter}
     */
    static new_from_coeffs_with_fs(coeffs, fs) {
        const ptr0 = passArrayF64ToWasm0(coeffs, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmfirfilter_new_from_coeffs_with_fs(ptr0, len0, fs);
        return WasmFIRFilter.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmfirfilter_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmFIRFilter.prototype[Symbol.dispose] = WasmFIRFilter.prototype.free;

export class WasmFiniteField2m {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFiniteField2m.prototype);
        obj.__wbg_ptr = ptr;
        WasmFiniteField2mFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFiniteField2mFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfinitefield2m_free(ptr, 0);
    }
    /**
     * @param {number} start
     * @returns {string}
     */
    cyclotomic_coset(start) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmfinitefield2m_cyclotomic_coset(this.__wbg_ptr, start);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {number} m
     * @returns {WasmFiniteField2m}
     */
    static new_auto(m) {
        const ret = wasm.wasmfinitefield2m_new_auto(m);
        return WasmFiniteField2m.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmfinitefield2m_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmFiniteField2m.prototype[Symbol.dispose] = WasmFiniteField2m.prototype.free;

export class WasmFiniteFieldApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFiniteFieldApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfinitefieldapi_free(ptr, 0);
    }
    /**
     * @param {string} a
     * @returns {boolean}
     */
    static gf256_inv_check(a) {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmfinitefieldapi_gf256_inv_check(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static gf256_mul(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmfinitefieldapi_gf256_mul(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static gfp5_add(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmfinitefieldapi_gfp5_add(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static gfp5_inv(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmfinitefieldapi_gfp5_inv(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static gfp5_mul(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmfinitefieldapi_gfp5_mul(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmfinitefieldapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmFiniteFieldApi.prototype[Symbol.dispose] = WasmFiniteFieldApi.prototype.free;

export class WasmGamma {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmGamma.prototype);
        obj.__wbg_ptr = ptr;
        WasmGammaFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmGammaFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmgamma_free(ptr, 0);
    }
    /**
     * @param {number} shape
     * @param {number} rate
     * @returns {WasmGamma}
     */
    static new(shape, rate) {
        const ret = wasm.wasmgamma_new(shape, rate);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGamma.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmgamma_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmGamma.prototype[Symbol.dispose] = WasmGamma.prototype.free;

export class WasmHamming74 {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmHamming74Finalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmhamming74_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmhamming74_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmHamming74.prototype[Symbol.dispose] = WasmHamming74.prototype.free;

export class WasmHuffmanCode {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmHuffmanCodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmhuffmancode_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmhuffmancode_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmHuffmanCode.prototype[Symbol.dispose] = WasmHuffmanCode.prototype.free;

export class WasmIIRFilter {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmIIRFilterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmiirfilter_free(ptr, 0);
    }
    /**
     * @param {WasmSignal} x
     * @returns {WasmSignal}
     */
    apply(x) {
        _assertClass(x, WasmSignal);
        const ret = wasm.wasmiirfilter_apply(this.__wbg_ptr, x.__wbg_ptr);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmiirfilter_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmIIRFilter.prototype[Symbol.dispose] = WasmIIRFilter.prototype.free;

export class WasmJonesCode {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmJonesCodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmjonescode_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmjonescode_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmJonesCode.prototype[Symbol.dispose] = WasmJonesCode.prototype.free;

export class WasmKalmanFilter {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmKalmanFilterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmkalmanfilter_free(ptr, 0);
    }
    predict() {
        wasm.wasmkalmanfilter_predict(this.__wbg_ptr);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmkalmanfilter_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmKalmanFilter.prototype[Symbol.dispose] = WasmKalmanFilter.prototype.free;

export class WasmLinalgApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmLinalgApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmlinalgapi_free(ptr, 0);
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static add_numeric(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_add_numeric(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static add_rational(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_add_rational(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static add_symbolic(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_add_symbolic(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static conj_transpose_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_conj_transpose_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static eigenvalues_numeric(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_eigenvalues_numeric(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static eigenvalues_rational(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_eigenvalues_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} _a
     * @returns {string}
     */
    static eigenvalues_symbolic(_a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(_a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_eigenvalues_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static inv_numeric(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_inv_numeric(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static inv_rational(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_inv_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static inv_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_inv_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static inverse_exact_rational(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_inverse_exact_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static inverse_exact_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_inverse_exact_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static lu_exact_rational(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_lu_exact_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static lu_exact_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_lu_exact_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static lu_numeric(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_lu_numeric(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static lu_rational(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_lu_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static lu_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_lu_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static mul_numeric(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_numeric(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static mul_rational(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_rational(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static mul_symbolic(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_symbolic(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    static mul_symbolic_complex(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_symbolic_complex(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a_csv
     * @param {string} v_csv
     * @returns {string}
     */
    static mul_vector_numeric(a_csv, v_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(v_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_vector_numeric(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a_csv
     * @param {string} v_csv
     * @returns {string}
     */
    static mul_vector_rational(a_csv, v_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(v_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_vector_rational(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a_csv
     * @param {string} v_csv
     * @returns {string}
     */
    static mul_vector_symbolic(a_csv, v_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(v_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_mul_vector_symbolic(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static qr_numeric(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_qr_numeric(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} _a
     * @returns {string}
     */
    static qr_rational(_a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(_a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_qr_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static qr_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_qr_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a_csv
     * @param {string} b_csv
     * @returns {string}
     */
    static solve_vector_numeric(a_csv, b_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_solve_vector_numeric(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a_csv
     * @param {string} b_csv
     * @returns {string}
     */
    static solve_vector_rational(a_csv, b_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_solve_vector_rational(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a_csv
     * @param {string} b_csv
     * @returns {string}
     */
    static solve_vector_symbolic(a_csv, b_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_solve_vector_symbolic(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static svd_numeric(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_svd_numeric(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} _a
     * @returns {string}
     */
    static svd_rational(_a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(_a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_svd_rational(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} a
     * @returns {string}
     */
    static svd_symbolic(a) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmlinalgapi_svd_symbolic(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmlinalgapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmLinalgApi.prototype[Symbol.dispose] = WasmLinalgApi.prototype.free;

export class WasmLz78Code {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmLz78CodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmlz78code_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmlz78code_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmLz78Code.prototype[Symbol.dispose] = WasmLz78Code.prototype.free;

export class WasmMarkov {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMarkovFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmarkov_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmmarkov_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmMarkov.prototype[Symbol.dispose] = WasmMarkov.prototype.free;

export class WasmMultinomial {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMultinomialFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmultinomial_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmmultinomial_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmMultinomial.prototype[Symbol.dispose] = WasmMultinomial.prototype.free;

export class WasmMultivariateNormal {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMultivariateNormalFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmultivariatenormal_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmmultivariatenormal_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmMultivariateNormal.prototype[Symbol.dispose] = WasmMultivariateNormal.prototype.free;

export class WasmMultivariateT {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMultivariateTFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmultivariatet_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmmultivariatet_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmMultivariateT.prototype[Symbol.dispose] = WasmMultivariateT.prototype.free;

export class WasmNormal {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmNormal.prototype);
        obj.__wbg_ptr = ptr;
        WasmNormalFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmNormalFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmnormal_free(ptr, 0);
    }
    /**
     * @param {number} mu
     * @param {number} sigma
     * @returns {WasmNormal}
     */
    static new(mu, sigma) {
        const ret = wasm.wasmnormal_new(mu, sigma);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmNormal.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmnormal_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmNormal.prototype[Symbol.dispose] = WasmNormal.prototype.free;

export class WasmPoisson {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmPoisson.prototype);
        obj.__wbg_ptr = ptr;
        WasmPoissonFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPoissonFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpoisson_free(ptr, 0);
    }
    /**
     * @param {number} lambda
     * @returns {WasmPoisson}
     */
    static new(lambda) {
        const ret = wasm.wasmpoisson_new(lambda);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmPoisson.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmpoisson_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmPoisson.prototype[Symbol.dispose] = WasmPoisson.prototype.free;

export class WasmPolynomialApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPolynomialApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpolynomialapi_free(ptr, 0);
    }
    /**
     * @param {string} coeffs
     * @returns {string}
     */
    static find_roots_symbolic_expr(coeffs) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(coeffs, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmpolynomialapi_find_roots_symbolic_expr(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmpolynomialapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmPolynomialApi.prototype[Symbol.dispose] = WasmPolynomialApi.prototype.free;

export class WasmPolynomialSolver {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPolynomialSolverFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpolynomialsolver_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmpolynomialsolver_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmPolynomialSolver.prototype[Symbol.dispose] = WasmPolynomialSolver.prototype.free;

export class WasmRational {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmRational.prototype);
        obj.__wbg_ptr = ptr;
        WasmRationalFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRationalFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrational_free(ptr, 0);
    }
    /**
     * @param {WasmRational} rhs
     * @returns {WasmRational}
     */
    checked_add(rhs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(rhs, WasmRational);
        var ptr0 = rhs.__destroy_into_raw();
        const ret = wasm.wasmrational_checked_add(ptr, ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmRational.__wrap(ret[0]);
    }
    /**
     * @param {WasmRational} rhs
     * @returns {WasmRational}
     */
    checked_div(rhs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(rhs, WasmRational);
        var ptr0 = rhs.__destroy_into_raw();
        const ret = wasm.wasmrational_checked_div(ptr, ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmRational.__wrap(ret[0]);
    }
    /**
     * @param {WasmRational} rhs
     * @returns {WasmRational}
     */
    checked_mul(rhs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(rhs, WasmRational);
        var ptr0 = rhs.__destroy_into_raw();
        const ret = wasm.wasmrational_checked_mul(ptr, ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmRational.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    denom() {
        const ret = wasm.wasmrational_denom(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} n
     * @returns {WasmRational}
     */
    static from_int(n) {
        const ret = wasm.wasmrational_from_int(n);
        return WasmRational.__wrap(ret);
    }
    /**
     * @param {string} latex
     * @returns {WasmRational}
     */
    static from_latex(latex) {
        const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrational_from_latex(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmRational.__wrap(ret[0]);
    }
    /**
     * @returns {boolean}
     */
    is_integer() {
        const ret = wasm.wasmrational_is_integer(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_minus_one() {
        const ret = wasm.wasmrational_is_minus_one(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_one() {
        const ret = wasm.wasmrational_is_one(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_zero() {
        const ret = wasm.wasmrational_is_zero(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {bigint} numer
     * @param {bigint} denom
     * @returns {WasmRational}
     */
    static new(numer, denom) {
        const ret = wasm.wasmrational_new(numer, denom);
        return WasmRational.__wrap(ret);
    }
    normalize() {
        wasm.wasmrational_normalize(this.__wbg_ptr);
    }
    /**
     * @returns {bigint}
     */
    numer() {
        const ret = wasm.wasmrational_numer(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {WasmRational}
     */
    simplified() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmrational_simplified(ptr);
        return WasmRational.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmrational_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    to_latex() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmrational_to_latex(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {bigint} numer
     * @param {bigint} denom
     * @returns {WasmRational}
     */
    static try_new(numer, denom) {
        const ret = wasm.wasmrational_try_new(numer, denom);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmRational.__wrap(ret[0]);
    }
}
if (Symbol.dispose) WasmRational.prototype[Symbol.dispose] = WasmRational.prototype.free;

export class WasmRationalMatrixApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRationalMatrixApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrationalmatrixapi_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmrationalmatrixapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmRationalMatrixApi.prototype[Symbol.dispose] = WasmRationalMatrixApi.prototype.free;

export class WasmRationalMatrixDtoApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRationalMatrixDtoApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrationalmatrixdtoapi_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmrationalmatrixdtoapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmRationalMatrixDtoApi.prototype[Symbol.dispose] = WasmRationalMatrixDtoApi.prototype.free;

export class WasmRecurrenceRelation {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRecurrenceRelationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrecurrencerelation_free(ptr, 0);
    }
    /**
     * @returns {WasmClosedForm}
     */
    solve() {
        const ret = wasm.wasmrecurrencerelation_solve(this.__wbg_ptr);
        return WasmClosedForm.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmrecurrencerelation_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmRecurrenceRelation.prototype[Symbol.dispose] = WasmRecurrenceRelation.prototype.free;

export class WasmReedSolomon {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmReedSolomonFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmreedsolomon_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmreedsolomon_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmReedSolomon.prototype[Symbol.dispose] = WasmReedSolomon.prototype.free;

export class WasmSignal {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSignal.prototype);
        obj.__wbg_ptr = ptr;
        WasmSignalFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSignalFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsignal_free(ptr, 0);
    }
    /**
     * @param {WasmFIRFilter} filter
     * @returns {WasmSignal}
     */
    apply_fir_filter(filter) {
        _assertClass(filter, WasmFIRFilter);
        const ret = wasm.wasmsignal_apply_fir_filter(this.__wbg_ptr, filter.__wbg_ptr);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @param {WasmIIRFilter} filt
     * @returns {WasmSignal}
     */
    apply_iir(filt) {
        _assertClass(filt, WasmIIRFilter);
        const ret = wasm.wasmsignal_apply_iir(this.__wbg_ptr, filt.__wbg_ptr);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @param {WasmSignal} h
     * @returns {WasmSignal}
     */
    convolve(h) {
        _assertClass(h, WasmSignal);
        const ret = wasm.wasmsignal_convolve(this.__wbg_ptr, h.__wbg_ptr);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @param {number} factor
     * @returns {WasmSignal}
     */
    decimate(factor) {
        const ret = wasm.wasmsignal_decimate(this.__wbg_ptr, factor);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @returns {WasmSpectrum}
     */
    dft() {
        const ret = wasm.wasmsignal_dft(this.__wbg_ptr);
        return WasmSpectrum.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    duration() {
        const ret = wasm.wasmsignal_duration(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} factor
     * @returns {WasmSignal}
     */
    expand(factor) {
        const ret = wasm.wasmsignal_expand(this.__wbg_ptr, factor);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @param {string} path
     * @param {number} sample_rate
     * @returns {WasmSignal}
     */
    static from_image_grayscale(path, sample_rate) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_from_image_grayscale(ptr0, len0, sample_rate);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSignal.__wrap(ret[0]);
    }
    /**
     * @param {string} path
     * @param {number} sample_rate
     * @returns {WasmSignal}
     */
    static from_image_rgb(path, sample_rate) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_from_image_rgb(ptr0, len0, sample_rate);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSignal.__wrap(ret[0]);
    }
    /**
     * @param {string} path
     * @returns {WasmSignal}
     */
    static from_wav_mono(path) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_from_wav_mono(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSignal.__wrap(ret[0]);
    }
    /**
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm.wasmsignal_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {Float64Array} data
     * @param {number} sample_rate
     * @returns {WasmSignal}
     */
    static new(data, sample_rate) {
        const ptr0 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_new(ptr0, len0, sample_rate);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    sample_rate() {
        const ret = wasm.wasmsignal_sample_rate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} path
     * @param {number} width
     * @param {number} height
     */
    save_image_grayscale(path, width, height) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_save_image_grayscale(this.__wbg_ptr, ptr0, len0, width, height);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} path
     * @param {number} width
     * @param {number} height
     */
    save_image_rgb(path, width, height) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_save_image_rgb(this.__wbg_ptr, ptr0, len0, width, height);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} path
     * @param {number} width
     * @param {number} height
     */
    save_svg(path, width, height) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_save_svg(this.__wbg_ptr, ptr0, len0, width, height);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} path
     * @param {number} width
     * @param {number} height
     * @param {string} label
     */
    save_svg_with_axes(path, width, height, label) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_save_svg_with_axes(this.__wbg_ptr, ptr0, len0, width, height, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} path
     */
    save_wav_mono(path) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignal_save_wav_mono(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsignal_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmSignal.prototype[Symbol.dispose] = WasmSignal.prototype.free;

export class WasmSignalProcessingApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSignalProcessingApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsignalprocessingapi_free(ptr, 0);
    }
    /**
     * @param {Float64Array} x
     * @param {Float64Array} h
     * @returns {Float64Array}
     */
    static conv_auto_f64(x, h) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(h, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_conv_auto_f64(ptr0, len0, ptr1, len1);
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * @param {Float64Array} x
     * @param {Float64Array} h
     * @returns {Float64Array}
     */
    static conv_simple_f64(x, h) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(h, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_conv_simple_f64(ptr0, len0, ptr1, len1);
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * @param {Float64Array} signal
     * @param {number} factor
     * @returns {Float64Array}
     */
    static decimate(signal, factor) {
        const ptr0 = passArrayF64ToWasm0(signal, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_decimate(ptr0, len0, factor);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {number} num_taps
     * @param {number} normalized_f1
     * @param {number} normalized_f2
     * @param {string} window_type
     * @param {number} kaiser_beta
     * @returns {Float64Array}
     */
    static design_fir_bandpass_taps(num_taps, normalized_f1, normalized_f2, window_type, kaiser_beta) {
        const ptr0 = passStringToWasm0(window_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_design_fir_bandpass_taps(num_taps, normalized_f1, normalized_f2, ptr0, len0, kaiser_beta);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {number} num_taps
     * @param {number} normalized_f1
     * @param {number} normalized_f2
     * @param {string} window_type
     * @param {number} kaiser_beta
     * @returns {Float64Array}
     */
    static design_fir_bandstop_taps(num_taps, normalized_f1, normalized_f2, window_type, kaiser_beta) {
        const ptr0 = passStringToWasm0(window_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_design_fir_bandstop_taps(num_taps, normalized_f1, normalized_f2, ptr0, len0, kaiser_beta);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {number} num_taps
     * @param {number} normalized_cutoff
     * @param {string} window_type
     * @param {number} kaiser_beta
     * @returns {Float64Array}
     */
    static design_fir_highpass_taps(num_taps, normalized_cutoff, window_type, kaiser_beta) {
        const ptr0 = passStringToWasm0(window_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_design_fir_highpass_taps(num_taps, normalized_cutoff, ptr0, len0, kaiser_beta);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {number} num_taps
     * @param {number} normalized_cutoff
     * @param {string} window_type
     * @param {number} kaiser_beta
     * @returns {Float64Array}
     */
    static design_fir_lowpass_taps(num_taps, normalized_cutoff, window_type, kaiser_beta) {
        const ptr0 = passStringToWasm0(window_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_design_fir_lowpass_taps(num_taps, normalized_cutoff, ptr0, len0, kaiser_beta);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} signal
     * @param {number} sample_rate
     * @returns {Float64Array}
     */
    static dft_magnitudes(signal, sample_rate) {
        const ptr0 = passArrayF64ToWasm0(signal, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_dft_magnitudes(ptr0, len0, sample_rate);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} signal
     * @param {number} factor
     * @returns {Float64Array}
     */
    static expand(signal, factor) {
        const ptr0 = passArrayF64ToWasm0(signal, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_expand(ptr0, len0, factor);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * @param {Float64Array} x
     * @param {number} fs
     * @param {number} order
     * @param {string} spec
     * @param {number} f1_hz
     * @param {number} f2_hz
     * @returns {Float64Array}
     */
    static iir_butterworth_apply_f64(x, fs, order, spec, f1_hz, f2_hz) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_iir_butterworth_apply_f64(ptr0, len0, fs, order, ptr1, len1, f1_hz, f2_hz);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * @param {Float64Array} x
     * @param {number} fs
     * @param {number} order
     * @param {number} ripple_db
     * @param {string} spec
     * @param {number} f1_hz
     * @param {number} f2_hz
     * @returns {Float64Array}
     */
    static iir_chebyshev1_apply_f64(x, fs, order, ripple_db, spec, f1_hz, f2_hz) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_iir_chebyshev1_apply_f64(ptr0, len0, fs, order, ripple_db, ptr1, len1, f1_hz, f2_hz);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * @param {Float64Array} x
     * @param {number} fs
     * @param {number} order
     * @param {number} stopband_atten_db
     * @param {string} spec
     * @param {number} f1_hz
     * @param {number} f2_hz
     * @returns {Float64Array}
     */
    static iir_chebyshev2_apply_f64(x, fs, order, stopband_atten_db, spec, f1_hz, f2_hz) {
        const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_iir_chebyshev2_apply_f64(ptr0, len0, fs, order, stopband_atten_db, ptr1, len1, f1_hz, f2_hz);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v3;
    }
    /**
     * @param {Float32Array} data
     * @param {number} width
     * @param {number} height
     * @param {Float32Array} kernel
     * @param {number} kernel_width
     * @param {number} kernel_height
     * @param {string} border_mode
     * @param {number} border_constant
     * @returns {Float32Array}
     */
    static image_convolve2d_simple_f32(data, width, height, kernel, kernel_width, kernel_height, border_mode, border_constant) {
        const ptr0 = passArrayF32ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF32ToWasm0(kernel, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(border_mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_image_convolve2d_simple_f32(ptr0, len0, width, height, ptr1, len1, kernel_width, kernel_height, ptr2, len2, border_constant);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v4 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v4;
    }
    /**
     * @param {Float32Array} data
     * @param {number} width
     * @param {number} height
     * @param {number} sigma
     * @param {number} radius
     * @param {string} border_mode
     * @param {number} border_constant
     * @returns {Float32Array}
     */
    static image_gaussian_blur_f32(data, width, height, sigma, radius, border_mode, border_constant) {
        const ptr0 = passArrayF32ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(border_mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsignalprocessingapi_image_gaussian_blur_f32(ptr0, len0, width, height, sigma, radius, ptr1, len1, border_constant);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v3;
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsignalprocessingapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmSignalProcessingApi.prototype[Symbol.dispose] = WasmSignalProcessingApi.prototype.free;

export class WasmSourceCodingApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSourceCodingApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsourcecodingapi_free(ptr, 0);
    }
    /**
     * @param {string} hex
     * @returns {string}
     */
    static arithmetic_decode_hex(hex) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmsourcecodingapi_arithmetic_decode_hex(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} input
     * @returns {string}
     */
    static arithmetic_encode_hex(input) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmsourcecodingapi_arithmetic_encode_hex(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} input
     * @returns {boolean}
     */
    static arithmetic_roundtrip(input) {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsourcecodingapi_arithmetic_roundtrip(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * @param {string} hex
     * @returns {string}
     */
    static huffman_decode_hex(hex) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmsourcecodingapi_huffman_decode_hex(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} input
     * @returns {string}
     */
    static huffman_encode_hex(input) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmsourcecodingapi_huffman_encode_hex(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} input
     * @returns {boolean}
     */
    static huffman_roundtrip(input) {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsourcecodingapi_huffman_roundtrip(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * @param {string} hex
     * @returns {string}
     */
    static lz78_decode_hex(hex) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmsourcecodingapi_lz78_decode_hex(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} input
     * @returns {string}
     */
    static lz78_encode_hex(input) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmsourcecodingapi_lz78_encode_hex(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} input
     * @returns {boolean}
     */
    static lz78_roundtrip(input) {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsourcecodingapi_lz78_roundtrip(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsourcecodingapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmSourceCodingApi.prototype[Symbol.dispose] = WasmSourceCodingApi.prototype.free;

export class WasmSpectrum {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSpectrum.prototype);
        obj.__wbg_ptr = ptr;
        WasmSpectrumFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSpectrumFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmspectrum_free(ptr, 0);
    }
    /**
     * @param {number} k
     * @returns {number}
     */
    bin_hz(k) {
        const ret = wasm.wasmspectrum_bin_hz(this.__wbg_ptr, k);
        return ret;
    }
    /**
     * @returns {WasmSignal}
     */
    ift() {
        const ret = wasm.wasmspectrum_ift(this.__wbg_ptr);
        return WasmSignal.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm.wasmspectrum_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} k
     * @returns {number}
     */
    magnitude(k) {
        const ret = wasm.wasmspectrum_magnitude(this.__wbg_ptr, k);
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    magnitudes() {
        const ret = wasm.wasmspectrum_magnitudes(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    sample_rate() {
        const ret = wasm.wasmspectrum_sample_rate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} path
     * @param {number} width
     * @param {number} height
     */
    save_svg_magnitude_db(path, width, height) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmspectrum_save_svg_magnitude_db(this.__wbg_ptr, ptr0, len0, width, height);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} path
     * @param {number} width
     * @param {number} height
     * @param {string} label
     */
    save_svg_magnitude_db_with_axes(path, width, height, label) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmspectrum_save_svg_magnitude_db_with_axes(this.__wbg_ptr, ptr0, len0, width, height, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmspectrum_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmSpectrum.prototype[Symbol.dispose] = WasmSpectrum.prototype.free;

export class WasmStatisticsApi {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmStatisticsApiFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmstatisticsapi_free(ptr, 0);
    }
    /**
     * @param {string} data_csv
     * @param {number} std
     * @returns {string}
     */
    static add_gaussian_noise(data_csv, std) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(data_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_add_gaussian_noise(ptr0, len0, std);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} data_csv
     * @param {number} count
     * @param {number} min_val
     * @param {number} max_val
     * @returns {string}
     */
    static add_outliers(data_csv, count, min_val, max_val) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(data_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_add_outliers(ptr0, len0, count, min_val, max_val);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {bigint} n
     * @param {number} p
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    static get_binomial_pmf_svg(n, p, width, height) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_get_binomial_pmf_svg(n, p, width, height);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} df
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    static get_chisq_pdf_svg(df, width, height) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_get_chisq_pdf_svg(df, width, height);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {string} data_csv
     * @returns {string}
     */
    static get_descriptive_stats(data_csv) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(data_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_get_descriptive_stats(ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {number} df1
     * @param {number} df2
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    static get_f_pdf_svg(df1, df2, width, height) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_get_f_pdf_svg(df1, df2, width, height);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} mean
     * @param {number} std
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    static get_normal_pdf_svg(mean, std, width, height) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_get_normal_pdf_svg(mean, std, width, height);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} lambda
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    static get_poisson_pmf_svg(lambda, width, height) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_get_poisson_pmf_svg(lambda, width, height);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} df
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    static get_t_pdf_svg(df, width, height) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_get_t_pdf_svg(df, width, height);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {string} coefficients_csv
     * @param {string} x_csv
     * @returns {number}
     */
    static logistic_predict(coefficients_csv, x_csv) {
        const ptr0 = passStringToWasm0(coefficients_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstatisticsapi_logistic_predict(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {string} coefficients_csv
     * @param {string} x_csv
     * @returns {number}
     */
    static logistic_predict_proba(coefficients_csv, x_csv) {
        const ptr0 = passStringToWasm0(coefficients_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstatisticsapi_logistic_predict_proba(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {string} y_csv
     * @param {string} h_matrix_csv
     * @param {number} max_iter
     * @param {number} tol
     * @returns {string}
     */
    static run_bayesian_em(y_csv, h_matrix_csv, max_iter, tol) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(h_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_bayesian_em(ptr0, len0, ptr1, len1, max_iter, tol);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} y_csv
     * @param {string} h_matrix_csv
     * @param {string} prior_mean_csv
     * @param {string} prior_cov_matrix_csv
     * @param {string} noise_cov_matrix_csv
     * @returns {string}
     */
    static run_bayesian_estimation(y_csv, h_matrix_csv, prior_mean_csv, prior_cov_matrix_csv, noise_cov_matrix_csv) {
        let deferred7_0;
        let deferred7_1;
        try {
            const ptr0 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(h_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(prior_mean_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(prior_cov_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(noise_cov_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len4 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_bayesian_estimation(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var ptr6 = ret[0];
            var len6 = ret[1];
            if (ret[3]) {
                ptr6 = 0; len6 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred7_0 = ptr6;
            deferred7_1 = len6;
            return getStringFromWasm0(ptr6, len6);
        } finally {
            wasm.__wbindgen_free(deferred7_0, deferred7_1, 1);
        }
    }
    /**
     * @param {string} y_csv
     * @param {string} h_matrix_csv
     * @param {string} prior_mean_csv
     * @param {string} prior_precision_matrix_csv
     * @param {string} noise_cov_matrix_csv
     * @returns {string}
     */
    static run_bayesian_estimation_with_precision(y_csv, h_matrix_csv, prior_mean_csv, prior_precision_matrix_csv, noise_cov_matrix_csv) {
        let deferred7_0;
        let deferred7_1;
        try {
            const ptr0 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(h_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(prior_mean_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(prior_precision_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(noise_cov_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len4 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_bayesian_estimation_with_precision(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var ptr6 = ret[0];
            var len6 = ret[1];
            if (ret[3]) {
                ptr6 = 0; len6 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred7_0 = ptr6;
            deferred7_1 = len6;
            return getStringFromWasm0(ptr6, len6);
        } finally {
            wasm.__wbindgen_free(deferred7_0, deferred7_1, 1);
        }
    }
    /**
     * @param {string} obs_csv
     * @param {string} exp_csv
     * @param {string} tail
     * @returns {string}
     */
    static run_chisq_gof(obs_csv, exp_csv, tail) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(obs_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(exp_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_chisq_gof(ptr0, len0, ptr1, len1, ptr2, len2);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {string} table_csv
     * @param {string} tail
     * @returns {string}
     */
    static run_chisq_independence(table_csv, tail) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(table_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_chisq_independence(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_csv
     * @param {string} y_csv
     * @param {string} tail
     * @param {number} alpha
     * @returns {string}
     */
    static run_f_test(x_csv, y_csv, tail, alpha) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_f_test(ptr0, len0, ptr1, len1, ptr2, len2, alpha);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {string} data_matrix_csv
     * @param {number} k
     * @param {number} max_iter
     * @param {number} tol
     * @returns {string}
     */
    static run_gmm_fit(data_matrix_csv, k, max_iter, tol) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(data_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_gmm_fit(ptr0, len0, k, max_iter, tol);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {string} data_matrix_csv
     * @param {string} x_csv
     * @param {number} k
     * @param {number} max_iter
     * @param {number} tol
     * @returns {number}
     */
    static run_gmm_log_pdf(data_matrix_csv, x_csv, k, max_iter, tol) {
        const ptr0 = passStringToWasm0(data_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstatisticsapi_run_gmm_log_pdf(ptr0, len0, ptr1, len1, k, max_iter, tol);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {string} data_matrix_csv
     * @param {string} x_csv
     * @param {number} k
     * @param {number} max_iter
     * @param {number} tol
     * @returns {number}
     */
    static run_gmm_pdf(data_matrix_csv, x_csv, k, max_iter, tol) {
        const ptr0 = passStringToWasm0(data_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstatisticsapi_run_gmm_pdf(ptr0, len0, ptr1, len1, k, max_iter, tol);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @param {string} data_matrix_csv
     * @param {string} x_csv
     * @param {number} k
     * @param {number} max_iter
     * @param {number} tol
     * @returns {number}
     */
    static run_gmm_predict(data_matrix_csv, x_csv, k, max_iter, tol) {
        const ptr0 = passStringToWasm0(data_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstatisticsapi_run_gmm_predict(ptr0, len0, ptr1, len1, k, max_iter, tol);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {string} data_matrix_csv
     * @param {string} x_csv
     * @param {number} k
     * @param {number} max_iter
     * @param {number} tol
     * @returns {string}
     */
    static run_gmm_predict_proba(data_matrix_csv, x_csv, k, max_iter, tol) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(data_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_gmm_predict_proba(ptr0, len0, ptr1, len1, k, max_iter, tol);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} initial_x_csv
     * @param {string} initial_p_matrix_csv
     * @param {string} f_matrix_csv
     * @param {string} h_matrix_csv
     * @param {string} q_matrix_csv
     * @param {string} r_matrix_csv
     * @param {string} observations_matrix_csv
     * @returns {string}
     */
    static run_kalman_filter(initial_x_csv, initial_p_matrix_csv, f_matrix_csv, h_matrix_csv, q_matrix_csv, r_matrix_csv, observations_matrix_csv) {
        let deferred9_0;
        let deferred9_1;
        try {
            const ptr0 = passStringToWasm0(initial_x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(initial_p_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(f_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(h_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(q_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len4 = WASM_VECTOR_LEN;
            const ptr5 = passStringToWasm0(r_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len5 = WASM_VECTOR_LEN;
            const ptr6 = passStringToWasm0(observations_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len6 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_kalman_filter(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6);
            var ptr8 = ret[0];
            var len8 = ret[1];
            if (ret[3]) {
                ptr8 = 0; len8 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred9_0 = ptr8;
            deferred9_1 = len8;
            return getStringFromWasm0(ptr8, len8);
        } finally {
            wasm.__wbindgen_free(deferred9_0, deferred9_1, 1);
        }
    }
    /**
     * @param {string} groups_csv
     * @param {string} tail
     * @returns {string}
     */
    static run_kruskal_wallis(groups_csv, tail) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(groups_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_kruskal_wallis(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_matrix_csv
     * @param {string} y_csv
     * @param {number} alpha
     * @param {number} max_iter
     * @param {number} tol
     * @returns {string}
     */
    static run_lasso_regression(x_matrix_csv, y_csv, alpha, max_iter, tol) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(x_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_lasso_regression(ptr0, len0, ptr1, len1, alpha, max_iter, tol);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_matrix_csv
     * @param {string} y_csv
     * @param {number} alpha
     * @param {number} max_iter
     * @returns {string}
     */
    static run_logistic_regression(x_matrix_csv, y_csv, alpha, max_iter) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(x_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_logistic_regression(ptr0, len0, ptr1, len1, alpha, max_iter);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_csv
     * @param {string} y_csv
     * @param {string} tail
     * @param {boolean} continuity
     * @returns {string}
     */
    static run_mann_whitney_u(x_csv, y_csv, tail, continuity) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_mann_whitney_u(ptr0, len0, ptr1, len1, ptr2, len2, continuity);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {string} a_matrix_csv
     * @param {string} b_csv
     * @returns {string}
     */
    static run_ols_solve_linear_system(a_matrix_csv, b_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_ols_solve_linear_system(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} data_csv
     * @param {number} mu0
     * @param {string} tail
     * @param {number} alpha
     * @returns {string}
     */
    static run_one_sample_t_test(data_csv, mu0, tail, alpha) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(data_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_one_sample_t_test(ptr0, len0, mu0, ptr1, len1, alpha);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} groups_csv
     * @param {string} tail
     * @returns {string}
     */
    static run_one_way_anova(groups_csv, tail) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(groups_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_one_way_anova(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_csv
     * @param {string} y_csv
     * @param {string} tail
     * @param {number} alpha
     * @returns {string}
     */
    static run_pearson_correlation(x_csv, y_csv, tail, alpha) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_pearson_correlation(ptr0, len0, ptr1, len1, ptr2, len2, alpha);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {string} x_matrix_csv
     * @param {string} y_csv
     * @param {number} alpha
     * @returns {string}
     */
    static run_ridge_regression(x_matrix_csv, y_csv, alpha) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(x_matrix_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_ridge_regression(ptr0, len0, ptr1, len1, alpha);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_csv
     * @param {string} y_csv
     * @returns {string}
     */
    static run_simple_linear_regression(x_csv, y_csv) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_simple_linear_regression(ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} x_csv
     * @param {string} y_csv
     * @param {boolean} pooled
     * @param {string} tail
     * @param {number} alpha
     * @returns {string}
     */
    static run_two_sample_t_test(x_csv, y_csv, pooled, tail, alpha) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_two_sample_t_test(ptr0, len0, ptr1, len1, pooled, ptr2, len2, alpha);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {string} x_csv
     * @param {string} y_csv
     * @param {string} tail
     * @param {boolean} continuity
     * @returns {string}
     */
    static run_wilcoxon_signed_rank(x_csv, y_csv, tail, continuity) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(x_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(y_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_wilcoxon_signed_rank(ptr0, len0, ptr1, len1, ptr2, len2, continuity);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {bigint} successes
     * @param {bigint} n
     * @param {number} p0
     * @param {string} tail
     * @param {number} alpha
     * @returns {string}
     */
    static run_z_test_proportion(successes, n, p0, tail, alpha) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_z_test_proportion(successes, n, p0, ptr0, len0, alpha);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {bigint} x1
     * @param {bigint} n1
     * @param {bigint} x2
     * @param {bigint} n2
     * @param {string} tail
     * @returns {string}
     */
    static run_z_test_two_proportions(x1, n1, x2, n2, tail) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(tail, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmstatisticsapi_run_z_test_two_proportions(x1, n1, x2, n2, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {bigint} n_trials
     * @param {number} p
     * @param {number} n_samples
     * @returns {string}
     */
    static sample_binomial(n_trials, p, n_samples) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_sample_binomial(n_trials, p, n_samples);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} df
     * @param {number} n
     * @returns {string}
     */
    static sample_chisq(df, n) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_sample_chisq(df, n);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} df1
     * @param {number} df2
     * @param {number} n
     * @returns {string}
     */
    static sample_f(df1, df2, n) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_sample_f(df1, df2, n);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} mean
     * @param {number} std
     * @param {number} n
     * @returns {string}
     */
    static sample_normal(mean, std, n) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_sample_normal(mean, std, n);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} lambda
     * @param {number} n
     * @returns {string}
     */
    static sample_poisson(lambda, n) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_sample_poisson(lambda, n);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {number} df
     * @param {number} n
     * @returns {string}
     */
    static sample_t(df, n) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstatisticsapi_sample_t(df, n);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmstatisticsapi_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmStatisticsApi.prototype[Symbol.dispose] = WasmStatisticsApi.prototype.free;

export class WasmSvd {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSvdFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsvd_free(ptr, 0);
    }
    sort() {
        const ret = wasm.wasmsvd_sort(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsvd_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmSvd.prototype[Symbol.dispose] = WasmSvd.prototype.free;

export class WasmSymbolicComplex {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSymbolicComplex.prototype);
        obj.__wbg_ptr = ptr;
        WasmSymbolicComplexFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSymbolicComplexFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsymboliccomplex_free(ptr, 0);
    }
    /**
     * @param {WasmSymbolicComplex} other
     * @returns {WasmSymbolicComplex}
     */
    add(other) {
        _assertClass(other, WasmSymbolicComplex);
        const ret = wasm.wasmsymboliccomplex_add(this.__wbg_ptr, other.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicComplex}
     */
    conj() {
        const ret = wasm.wasmsymboliccomplex_conj(this.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicComplex}
     */
    expand() {
        const ret = wasm.wasmsymboliccomplex_expand(this.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @param {string} latex
     * @returns {WasmSymbolicComplex}
     */
    static from_latex(latex) {
        const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsymboliccomplex_from_latex(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSymbolicComplex.__wrap(ret[0]);
    }
    /**
     * @param {WasmSymbolicExpr} re
     * @returns {WasmSymbolicComplex}
     */
    static from_real(re) {
        _assertClass(re, WasmSymbolicExpr);
        var ptr0 = re.__destroy_into_raw();
        const ret = wasm.wasmsymboliccomplex_from_real(ptr0);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicComplex}
     */
    static i() {
        const ret = wasm.wasmsymboliccomplex_i();
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    is_imag_pure() {
        const ret = wasm.wasmsymboliccomplex_is_imag_pure(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_real() {
        const ret = wasm.wasmsymboliccomplex_is_real(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {WasmSymbolicComplex} other
     * @returns {WasmSymbolicComplex}
     */
    mul(other) {
        _assertClass(other, WasmSymbolicComplex);
        const ret = wasm.wasmsymboliccomplex_mul(this.__wbg_ptr, other.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicComplex}
     */
    neg() {
        const ret = wasm.wasmsymboliccomplex_neg(this.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @param {WasmSymbolicExpr} re
     * @param {WasmSymbolicExpr} im
     * @returns {WasmSymbolicComplex}
     */
    static new(re, im) {
        _assertClass(re, WasmSymbolicExpr);
        var ptr0 = re.__destroy_into_raw();
        _assertClass(im, WasmSymbolicExpr);
        var ptr1 = im.__destroy_into_raw();
        const ret = wasm.wasmsymboliccomplex_new(ptr0, ptr1);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicComplex}
     */
    simplify() {
        const ret = wasm.wasmsymboliccomplex_simplify(this.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @param {bigint} n
     * @param {bigint} d
     * @returns {WasmSymbolicComplex}
     */
    static sqrt_rational(n, d) {
        const ret = wasm.wasmsymboliccomplex_sqrt_rational(n, d);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @param {WasmSymbolicComplex} other
     * @returns {WasmSymbolicComplex}
     */
    sub(other) {
        _assertClass(other, WasmSymbolicComplex);
        const ret = wasm.wasmsymboliccomplex_sub(this.__wbg_ptr, other.__wbg_ptr);
        return WasmSymbolicComplex.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsymboliccomplex_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    to_latex() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsymboliccomplex_to_latex(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmSymbolicComplex}
     */
    static zero() {
        const ret = wasm.wasmsymboliccomplex_zero();
        return WasmSymbolicComplex.__wrap(ret);
    }
}
if (Symbol.dispose) WasmSymbolicComplex.prototype[Symbol.dispose] = WasmSymbolicComplex.prototype.free;

export class WasmSymbolicExpr {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSymbolicExpr.prototype);
        obj.__wbg_ptr = ptr;
        WasmSymbolicExprFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSymbolicExprFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsymbolicexpr_free(ptr, 0);
    }
    /**
     * @param {string} terms
     * @returns {WasmSymbolicExpr}
     */
    static add(terms) {
        const ptr0 = passStringToWasm0(terms, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsymbolicexpr_add(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSymbolicExpr.__wrap(ret[0]);
    }
    /**
     * @returns {WasmSymbolicExpr}
     */
    expand() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmsymbolicexpr_expand(ptr);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @param {string} latex
     * @returns {WasmSymbolicExpr}
     */
    static from_latex(latex) {
        const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsymbolicexpr_from_latex(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSymbolicExpr.__wrap(ret[0]);
    }
    /**
     * @param {bigint} n
     * @returns {WasmSymbolicExpr}
     */
    static int(n) {
        const ret = wasm.wasmsymbolicexpr_int(n);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @param {string} factors
     * @returns {WasmSymbolicExpr}
     */
    static mul(factors) {
        const ptr0 = passStringToWasm0(factors, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsymbolicexpr_mul(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSymbolicExpr.__wrap(ret[0]);
    }
    /**
     * @param {WasmSymbolicExpr} base
     * @param {WasmSymbolicExpr} exp
     * @returns {WasmSymbolicExpr}
     */
    static pow(base, exp) {
        _assertClass(base, WasmSymbolicExpr);
        var ptr0 = base.__destroy_into_raw();
        _assertClass(exp, WasmSymbolicExpr);
        var ptr1 = exp.__destroy_into_raw();
        const ret = wasm.wasmsymbolicexpr_pow(ptr0, ptr1);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @param {bigint} n
     * @param {bigint} d
     * @returns {WasmSymbolicExpr}
     */
    static rational(n, d) {
        const ret = wasm.wasmsymbolicexpr_rational(n, d);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicExpr}
     */
    simplify() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmsymbolicexpr_simplify(ptr);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicExpr}
     */
    sqrt() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmsymbolicexpr_sqrt(ptr);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @returns {WasmSymbolicExpr}
     */
    static sqrt2() {
        const ret = wasm.wasmsymbolicexpr_sqrt2();
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @param {string} sym
     * @param {WasmSymbolicExpr} val
     * @returns {WasmSymbolicExpr}
     */
    substitute(sym, val) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(sym, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(val, WasmSymbolicExpr);
        const ret = wasm.wasmsymbolicexpr_substitute(ptr, ptr0, len0, val.__wbg_ptr);
        return WasmSymbolicExpr.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsymbolicexpr_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    to_latex() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsymbolicexpr_to_latex(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmSymbolicExpr.prototype[Symbol.dispose] = WasmSymbolicExpr.prototype.free;

export class WasmT {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmT.prototype);
        obj.__wbg_ptr = ptr;
        WasmTFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmt_free(ptr, 0);
    }
    /**
     * @param {number} nu
     * @returns {WasmT}
     */
    static new(nu) {
        const ret = wasm.wasmt_new(nu);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmT.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmt_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmT.prototype[Symbol.dispose] = WasmT.prototype.free;

export class WasmUniform {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmUniform.prototype);
        obj.__wbg_ptr = ptr;
        WasmUniformFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUniformFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmuniform_free(ptr, 0);
    }
    /**
     * @param {number} min
     * @param {number} max
     * @returns {WasmUniform}
     */
    static new(min, max) {
        const ret = wasm.wasmuniform_new(min, max);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmUniform.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmuniform_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmUniform.prototype[Symbol.dispose] = WasmUniform.prototype.free;

/**
 * @param {any} a0_value
 * @param {any} d_value
 * @param {any} r_value
 * @param {any} n_value
 * @returns {any}
 */
export function arith_geom_sum(a0_value, d_value, r_value, n_value) {
    const ret = wasm.arith_geom_sum(a0_value, d_value, r_value, n_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} a0_value
 * @param {any} d_value
 * @param {any} n_value
 * @returns {any}
 */
export function arithmetic_sum(a0_value, d_value, n_value) {
    const ret = wasm.arithmetic_sum(a0_value, d_value, n_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} k
 * @returns {any}
 */
export function cm_binom_x_plus_k_choose_k_poly(k) {
    const ret = wasm.cm_binom_x_plus_k_choose_k_poly(k);
    return ret;
}

/**
 * @param {number} m
 * @returns {any}
 */
export function cm_falling_factorial_poly(m) {
    const ret = wasm.cm_falling_factorial_poly(m);
    return ret;
}

/**
 * @param {number} m
 * @returns {any}
 */
export function cm_rising_factorial_poly(m) {
    const ret = wasm.cm_rising_factorial_poly(m);
    return ret;
}

/**
 * @param {any[]} poly_coeffs
 * @returns {any}
 */
export function discrete_diff(poly_coeffs) {
    const ptr0 = passArrayJsValueToWasm0(poly_coeffs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.discrete_diff(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any[]} poly_coeffs
 * @returns {any}
 */
export function discrete_sum(poly_coeffs) {
    const ptr0 = passArrayJsValueToWasm0(poly_coeffs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.discrete_sum(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} points_value
 * @returns {any}
 */
export function dto_point_batch(points_value) {
    const ret = wasm.dto_point_batch(points_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} values_value
 * @returns {any}
 */
export function dto_point_by_name(values_value) {
    const ret = wasm.dto_point_by_name(values_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} point_value
 * @returns {any}
 */
export function dto_point_checked(point_value) {
    const ret = wasm.dto_point_checked(point_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} values_value
 * @returns {any}
 */
export function dto_point_fixed(values_value) {
    const ret = wasm.dto_point_fixed(values_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} value_value
 * @returns {any}
 */
export function dto_point_label(value_value) {
    const ret = wasm.dto_point_label(value_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} point_value
 * @returns {any}
 */
export function dto_point_maybe(point_value) {
    const ret = wasm.dto_point_maybe(point_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} point_value
 * @returns {any}
 */
export function dto_point_nested(point_value) {
    const ret = wasm.dto_point_nested(point_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {any}
 */
export function dto_point_new(x, y) {
    const ret = wasm.dto_point_new(x, y);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} value_value
 * @returns {any}
 */
export function dto_point_pair(value_value) {
    const ret = wasm.dto_point_pair(value_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} point_value
 * @param {number} dx
 * @param {number} dy
 * @returns {any}
 */
export function dto_point_translate(point_value, dx, dy) {
    const ret = wasm.dto_point_translate(point_value, dx, dy);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @param {number} n
 * @returns {any}
 */
export function eval_closed_form(dto_value, n) {
    const ret = wasm.eval_closed_form(dto_value, n);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Float64Array} coeffs
 * @param {Float64Array} initials
 * @param {any} non_homogeneous_value
 * @param {number} n
 * @returns {any}
 */
export function eval_recurrence_iterative(coeffs, initials, non_homogeneous_value, n) {
    const ptr0 = passArrayF64ToWasm0(coeffs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(initials, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.eval_recurrence_iterative(ptr0, len0, ptr1, len1, non_homogeneous_value, n);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function format_closed_form(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.format_closed_form(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {any} r_value
 * @param {any} n_value
 * @returns {any}
 */
export function geometric_sum(r_value, n_value) {
    const ret = wasm.geometric_sum(r_value, n_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {any}
 */
export function partial_sum(dto_value) {
    const ret = wasm.partial_sum(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function poly_add_numeric(a, b) {
    const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.poly_add_numeric(ptr0, len0, ptr1, len1);
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_add_rational(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_add_rational(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_add_symbolic(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_add_symbolic(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function poly_div_numeric(a, b) {
    const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.poly_div_numeric(ptr0, len0, ptr1, len1);
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_div_rational(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_div_rational(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_div_symbolic(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_div_symbolic(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function poly_mul_numeric(a, b) {
    const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.poly_mul_numeric(ptr0, len0, ptr1, len1);
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_mul_rational(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_mul_rational(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_mul_symbolic(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_mul_symbolic(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @returns {Float64Array}
 */
export function poly_sub_numeric(a, b) {
    const ptr0 = passArrayF64ToWasm0(a, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(b, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.poly_sub_numeric(ptr0, len0, ptr1, len1);
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_sub_rational(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_sub_rational(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} a_csv
 * @param {string} b_csv
 * @returns {string}
 */
export function poly_sub_symbolic(a_csv, b_csv) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.poly_sub_symbolic(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {any} a_value
 * @param {any} b_value
 * @returns {any}
 */
export function rationalCheckedAddDto(a_value, b_value) {
    const ret = wasm.rationalCheckedAddDto(a_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} a_value
 * @param {any} b_value
 * @returns {any}
 */
export function rationalCheckedDivDto(a_value, b_value) {
    const ret = wasm.rationalCheckedDivDto(a_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} a_value
 * @param {any} b_value
 * @returns {any}
 */
export function rationalCheckedMulDto(a_value, b_value) {
    const ret = wasm.rationalCheckedMulDto(a_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {bigint} numer
 * @param {bigint} denom
 * @returns {any}
 */
export function rationalCreateDto(numer, denom) {
    const ret = wasm.rationalCreateDto(numer, denom);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {string}
 */
export function rationalDenomDto(self_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rationalDenomDto(self_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function rationalFormatDto(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rationalFormatDto(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function rationalFormatDtoToLatex(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rationalFormatDtoToLatex(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {bigint} n
 * @returns {any}
 */
export function rationalFromIntDto(n) {
    const ret = wasm.rationalFromIntDto(n);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} latex
 * @returns {any}
 */
export function rationalFromLatexDto(latex) {
    const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rationalFromLatexDto(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {boolean}
 */
export function rationalIsIntegerDto(dto_value) {
    const ret = wasm.rationalIsIntegerDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {any} dto_value
 * @returns {boolean}
 */
export function rationalIsMinusOneDto(dto_value) {
    const ret = wasm.rationalIsMinusOneDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {any} dto_value
 * @returns {boolean}
 */
export function rationalIsOneDto(dto_value) {
    const ret = wasm.rationalIsOneDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {any} dto_value
 * @returns {boolean}
 */
export function rationalIsZeroDto(dto_value) {
    const ret = wasm.rationalIsZeroDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {string} numer
 * @param {string} denom
 * @returns {any}
 */
export function rationalNewDto(numer, denom) {
    const ptr0 = passStringToWasm0(numer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(denom, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.rationalNewDto(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {any}
 */
export function rationalNormalizeDto(dto_value) {
    const ret = wasm.rationalNormalizeDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {string}
 */
export function rationalNumerDto(self_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rationalNumerDto(self_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} input
 * @returns {any}
 */
export function rationalParseDto(input) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rationalParseDto(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} latex
 * @returns {any}
 */
export function rationalParseDtoFromLatex(latex) {
    const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rationalParseDtoFromLatex(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {any}
 */
export function rationalSimplifiedDto(self_value) {
    const ret = wasm.rationalSimplifiedDto(self_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {any}
 */
export function rationalSimplifyDto(dto_value) {
    const ret = wasm.rationalSimplifyDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} input
 * @returns {any}
 */
export function rationalSimplifyDtoFromText(input) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rationalSimplifyDtoFromText(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function rationalToLatexDto(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rationalToLatexDto(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {bigint} numer
 * @param {bigint} denom
 * @returns {any}
 */
export function rationalTryNewDto(numer, denom) {
    const ret = wasm.rationalTryNewDto(numer, denom);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
export function rational_matrix_add(a, b) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rational_matrix_add(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {any} value_value
 * @param {any} b_value
 * @returns {any}
 */
export function rational_matrix_dto_add(value_value, b_value) {
    const ret = wasm.rational_matrix_dto_add(value_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} value_value
 * @returns {any}
 */
export function rational_matrix_dto_inverse(value_value) {
    const ret = wasm.rational_matrix_dto_inverse(value_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} value_value
 * @param {any} b_value
 * @returns {any}
 */
export function rational_matrix_dto_mul(value_value, b_value) {
    const ret = wasm.rational_matrix_dto_mul(value_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} value_value
 * @returns {number}
 */
export function rational_matrix_dto_rows(value_value) {
    const ret = wasm.rational_matrix_dto_rows(value_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * @param {any} value_value
 * @returns {any}
 */
export function rational_matrix_dto_transpose(value_value) {
    const ret = wasm.rational_matrix_dto_transpose(value_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} rows
 * @param {number} cols
 * @returns {any}
 */
export function rational_matrix_dto_zeros(rows, cols) {
    const ret = wasm.rational_matrix_dto_zeros(rows, cols);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} a
 * @returns {string}
 */
export function rational_matrix_first(a) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rational_matrix_first(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} a
 * @returns {string}
 */
export function rational_matrix_inverse(a) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rational_matrix_inverse(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
export function rational_matrix_mul(a, b) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rational_matrix_mul(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} a
 * @returns {number}
 */
export function rational_matrix_rows(a) {
    const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rational_matrix_rows(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * @param {string} a
 * @returns {string}
 */
export function rational_matrix_transpose(a) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rational_matrix_transpose(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {number} rows
 * @param {number} cols
 * @returns {string}
 */
export function rational_matrix_zeros(rows, cols) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rational_matrix_zeros(rows, cols);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export function sf_beta(x, y) {
    const ret = wasm.sf_beta(x, y);
    return ret;
}

/**
 * @param {number} z
 * @returns {number}
 */
export function sf_erf(z) {
    const ret = wasm.sf_erf(z);
    return ret;
}

/**
 * @param {number} z
 * @returns {number}
 */
export function sf_gamma(z) {
    const ret = wasm.sf_gamma(z);
    return ret;
}

/**
 * @param {number} z
 * @returns {number}
 */
export function sf_log_gamma(z) {
    const ret = wasm.sf_log_gamma(z);
    return ret;
}

/**
 * @param {number} s
 * @param {number} x
 * @returns {number}
 */
export function sf_regularized_gamma(s, x) {
    const ret = wasm.sf_regularized_gamma(s, x);
    return ret;
}

/**
 * @param {Float64Array} coeffs
 * @returns {any}
 */
export function solve_polynomial_numeric(coeffs) {
    const ptr0 = passArrayF64ToWasm0(coeffs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.solve_polynomial_numeric(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} coeffs_csv
 * @returns {any}
 */
export function solve_polynomial_rational(coeffs_csv) {
    const ptr0 = passStringToWasm0(coeffs_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.solve_polynomial_rational(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} coeffs_csv
 * @returns {any}
 */
export function solve_polynomial_symbolic(coeffs_csv) {
    const ptr0 = passStringToWasm0(coeffs_csv, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.solve_polynomial_symbolic(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Float64Array} coeffs
 * @param {Float64Array} initials
 * @param {any} non_homogeneous_value
 * @returns {any}
 */
export function solve_recurrence(coeffs, initials, non_homogeneous_value) {
    const ptr0 = passArrayF64ToWasm0(coeffs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(initials, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.solve_recurrence(ptr0, len0, ptr1, len1, non_homogeneous_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} coeffs_value
 * @param {any} initials_value
 * @param {any} non_homogeneous_value
 * @returns {any}
 */
export function solve_recurrence_symbolic(coeffs_value, initials_value, non_homogeneous_value) {
    const ret = wasm.solve_recurrence_symbolic(coeffs_value, initials_value, non_homogeneous_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} a_value
 * @param {any} b_value
 * @returns {any}
 */
export function symbolicComplexAddDto(a_value, b_value) {
    const ret = wasm.symbolicComplexAddDto(a_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {any}
 */
export function symbolicComplexConjDto(self_value) {
    const ret = wasm.symbolicComplexConjDto(self_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {any}
 */
export function symbolicComplexExpandDto(self_value) {
    const ret = wasm.symbolicComplexExpandDto(self_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function symbolicComplexFormatDto(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.symbolicComplexFormatDto(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function symbolicComplexFormatDtoToLatex(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.symbolicComplexFormatDtoToLatex(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} latex
 * @returns {any}
 */
export function symbolicComplexFromLatexDto(latex) {
    const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicComplexFromLatexDto(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} re_value
 * @returns {any}
 */
export function symbolicComplexFromRealDto(re_value) {
    const ret = wasm.symbolicComplexFromRealDto(re_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @returns {any}
 */
export function symbolicComplexIDto() {
    const ret = wasm.symbolicComplexIDto();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {boolean}
 */
export function symbolicComplexIsImagPureDto(dto_value) {
    const ret = wasm.symbolicComplexIsImagPureDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {any} dto_value
 * @returns {boolean}
 */
export function symbolicComplexIsRealDto(dto_value) {
    const ret = wasm.symbolicComplexIsRealDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {any} a_value
 * @param {any} b_value
 * @returns {any}
 */
export function symbolicComplexMulDto(a_value, b_value) {
    const ret = wasm.symbolicComplexMulDto(a_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {any}
 */
export function symbolicComplexNegDto(dto_value) {
    const ret = wasm.symbolicComplexNegDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} re_value
 * @param {any} im_value
 * @returns {any}
 */
export function symbolicComplexNewDto(re_value, im_value) {
    const ret = wasm.symbolicComplexNewDto(re_value, im_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} input
 * @returns {any}
 */
export function symbolicComplexParseDto(input) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicComplexParseDto(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} latex
 * @returns {any}
 */
export function symbolicComplexParseDtoFromLatex(latex) {
    const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicComplexParseDtoFromLatex(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {any}
 */
export function symbolicComplexSimplifyDto(dto_value) {
    const ret = wasm.symbolicComplexSimplifyDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {bigint} n
 * @param {bigint} d
 * @returns {any}
 */
export function symbolicComplexSqrtRationalDto(n, d) {
    const ret = wasm.symbolicComplexSqrtRationalDto(n, d);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} a_value
 * @param {any} b_value
 * @returns {any}
 */
export function symbolicComplexSubDto(a_value, b_value) {
    const ret = wasm.symbolicComplexSubDto(a_value, b_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {string}
 */
export function symbolicComplexToLatexDto(self_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.symbolicComplexToLatexDto(self_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @returns {any}
 */
export function symbolicComplexZeroDto() {
    const ret = wasm.symbolicComplexZeroDto();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} terms_value
 * @returns {any}
 */
export function symbolicExprAddDto(terms_value) {
    const ret = wasm.symbolicExprAddDto(terms_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {any}
 */
export function symbolicExprExpandDto(self_value) {
    const ret = wasm.symbolicExprExpandDto(self_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function symbolicExprFormatDto(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.symbolicExprFormatDto(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {any} dto_value
 * @returns {string}
 */
export function symbolicExprFormatDtoToLatex(dto_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.symbolicExprFormatDtoToLatex(dto_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} latex
 * @returns {any}
 */
export function symbolicExprFromLatexDto(latex) {
    const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicExprFromLatexDto(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {bigint} n
 * @returns {any}
 */
export function symbolicExprIntDto(n) {
    const ret = wasm.symbolicExprIntDto(n);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} factors_value
 * @returns {any}
 */
export function symbolicExprMulDto(factors_value) {
    const ret = wasm.symbolicExprMulDto(factors_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} input
 * @returns {any}
 */
export function symbolicExprParseDto(input) {
    const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicExprParseDto(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} latex
 * @returns {any}
 */
export function symbolicExprParseDtoFromLatex(latex) {
    const ptr0 = passStringToWasm0(latex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicExprParseDtoFromLatex(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} base_value
 * @param {any} exp_value
 * @returns {any}
 */
export function symbolicExprPowDto(base_value, exp_value) {
    const ret = wasm.symbolicExprPowDto(base_value, exp_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {bigint} n
 * @param {bigint} d
 * @returns {any}
 */
export function symbolicExprRationalDto(n, d) {
    const ret = wasm.symbolicExprRationalDto(n, d);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} dto_value
 * @returns {any}
 */
export function symbolicExprSimplifyDto(dto_value) {
    const ret = wasm.symbolicExprSimplifyDto(dto_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @returns {any}
 */
export function symbolicExprSqrt2Dto() {
    const ret = wasm.symbolicExprSqrt2Dto();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {any}
 */
export function symbolicExprSqrtDto(self_value) {
    const ret = wasm.symbolicExprSqrtDto(self_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @param {string} sym
 * @param {any} val_value
 * @returns {any}
 */
export function symbolicExprSubstituteDto(self_value, sym, val_value) {
    const ptr0 = passStringToWasm0(sym, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolicExprSubstituteDto(self_value, ptr0, len0, val_value);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} self_value
 * @returns {string}
 */
export function symbolicExprToLatexDto(self_value) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.symbolicExprToLatexDto(self_value);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}
export function __wbg_Error_83742b46f01ce22d(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_Number_a5a435bd7bbec835(arg0) {
    const ret = Number(arg0);
    return ret;
}
export function __wbg_String_8564e559799eccda(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_bigint_get_as_i64_447a76b5c6ef7bda(arg0, arg1) {
    const v = arg1;
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_boolean_get_c0f3f60bac5a78d1(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}
export function __wbg___wbindgen_debug_string_5398f5bb970e0daa(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_in_41dbb8413020e076(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
}
export function __wbg___wbindgen_is_bigint_e2141d4f045b7eda(arg0) {
    const ret = typeof(arg0) === 'bigint';
    return ret;
}
export function __wbg___wbindgen_is_function_3c846841762788c1(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
}
export function __wbg___wbindgen_is_null_0b605fc6b167c56f(arg0) {
    const ret = arg0 === null;
    return ret;
}
export function __wbg___wbindgen_is_object_781bc9f159099513(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
}
export function __wbg___wbindgen_is_string_7ef6b97b02428fae(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
}
export function __wbg___wbindgen_is_undefined_52709e72fb9f179c(arg0) {
    const ret = arg0 === undefined;
    return ret;
}
export function __wbg___wbindgen_jsval_eq_ee31bfad3e536463(arg0, arg1) {
    const ret = arg0 === arg1;
    return ret;
}
export function __wbg___wbindgen_jsval_loose_eq_5bcc3bed3c69e72b(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
}
export function __wbg___wbindgen_number_get_34bb9d9dcfa21373(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_string_get_395e606bd0ee4427(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_6ddd609b62940d55(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg_call_2d781c1f4d5c0ef8() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments); }
export function __wbg_call_e133b57c9155d22c() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments); }
export function __wbg_crypto_38df2bab126b63dc(arg0) {
    const ret = arg0.crypto;
    return ret;
}
export function __wbg_done_08ce71ee07e3bd17(arg0) {
    const ret = arg0.done;
    return ret;
}
export function __wbg_entries_e8a20ff8c9757101(arg0) {
    const ret = Object.entries(arg0);
    return ret;
}
export function __wbg_getRandomValues_c44a50d8cfdaebeb() { return handleError(function (arg0, arg1) {
    arg0.getRandomValues(arg1);
}, arguments); }
export function __wbg_get_326e41e095fb2575() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments); }
export function __wbg_get_a8ee5c45dabc1b3b(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
}
export function __wbg_get_unchecked_329cfe50afab7352(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
}
export function __wbg_get_with_ref_key_6412cf3094599694(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
}
export function __wbg_instanceof_ArrayBuffer_101e2bf31071a9f6(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Map_f194b366846aca0c(arg0) {
    let result;
    try {
        result = arg0 instanceof Map;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Uint8Array_740438561a5b956d(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_isArray_33b91feb269ff46e(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
}
export function __wbg_isSafeInteger_ecd6a7f9c3e053cd(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
}
export function __wbg_iterator_d8f549ec8fb061b1() {
    const ret = Symbol.iterator;
    return ret;
}
export function __wbg_length_b3416cf66a5452c8(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_length_ea16607d7b61445b(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_msCrypto_bd5a034af96bcba6(arg0) {
    const ret = arg0.msCrypto;
    return ret;
}
export function __wbg_new_49d5571bd3f0c4d4() {
    const ret = new Map();
    return ret;
}
export function __wbg_new_5f486cdf45a04d78(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
}
export function __wbg_new_a70fbab9066b301f() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_ab79df5bd7c26067() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_with_length_825018a1616e9e55(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return ret;
}
export function __wbg_next_11b99ee6237339e3() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments); }
export function __wbg_next_e01a967809d1aa68(arg0) {
    const ret = arg0.next;
    return ret;
}
export function __wbg_node_84ea875411254db1(arg0) {
    const ret = arg0.node;
    return ret;
}
export function __wbg_process_44c7a14e11e9f69e(arg0) {
    const ret = arg0.process;
    return ret;
}
export function __wbg_prototypesetcall_d62e5099504357e6(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_randomFillSync_6c25eac9869eb53c() { return handleError(function (arg0, arg1) {
    arg0.randomFillSync(arg1);
}, arguments); }
export function __wbg_require_b4edbdcf3e2a1ef0() { return handleError(function () {
    const ret = module.require;
    return ret;
}, arguments); }
export function __wbg_set_282384002438957f(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_set_6be42768c690e380(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
}
export function __wbg_set_bf7251625df30a02(arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2);
    return ret;
}
export function __wbg_static_accessor_GLOBAL_8adb955bd33fac2f() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_SELF_f207c857566db248() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_WINDOW_bb9f1ba69d61b386() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_subarray_a068d24e39478a8a(arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
    return ret;
}
export function __wbg_value_21fc78aab0322612(arg0) {
    const ret = arg0.value;
    return ret;
}
export function __wbg_versions_276b2795b1c6a219(arg0) {
    const ret = arg0.versions;
    return ret;
}
export function __wbindgen_cast_0000000000000001(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0) {
    // Cast intrinsic for `I64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_0000000000000003(arg0, arg1) {
    // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
    const ret = getArrayU8FromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_cast_0000000000000004(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_cast_0000000000000005(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const WasmAdaptiveFilterLMSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmadaptivefilterlms_free(ptr >>> 0, 1));
const WasmAdaptiveFilterNLMSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmadaptivefilternlms_free(ptr >>> 0, 1));
const WasmArithmeticCodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmarithmeticcode_free(ptr >>> 0, 1));
const WasmBCHCodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmbchcode_free(ptr >>> 0, 1));
const WasmBernoulliFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmbernoulli_free(ptr >>> 0, 1));
const WasmBinomialFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmbinomial_free(ptr >>> 0, 1));
const WasmBlockHuffmanTreeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmblockhuffmantree_free(ptr >>> 0, 1));
const WasmCategoricalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcategorical_free(ptr >>> 0, 1));
const WasmChiSquareFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmchisquare_free(ptr >>> 0, 1));
const WasmClosedFormFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmclosedform_free(ptr >>> 0, 1));
const WasmCodingApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcodingapi_free(ptr >>> 0, 1));
const WasmConcreteMathApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmconcretemathapi_free(ptr >>> 0, 1));
const WasmDirichletFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdirichlet_free(ptr >>> 0, 1));
const WasmDtoFixtureApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdtofixtureapi_free(ptr >>> 0, 1));
const WasmExponentialFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmexponential_free(ptr >>> 0, 1));
const WasmFFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmf_free(ptr >>> 0, 1));
const WasmFIRFilterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfirfilter_free(ptr >>> 0, 1));
const WasmFiniteField2mFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfinitefield2m_free(ptr >>> 0, 1));
const WasmFiniteFieldApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfinitefieldapi_free(ptr >>> 0, 1));
const WasmGammaFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmgamma_free(ptr >>> 0, 1));
const WasmHamming74Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmhamming74_free(ptr >>> 0, 1));
const WasmHuffmanCodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmhuffmancode_free(ptr >>> 0, 1));
const WasmIIRFilterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmiirfilter_free(ptr >>> 0, 1));
const WasmJonesCodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmjonescode_free(ptr >>> 0, 1));
const WasmKalmanFilterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmkalmanfilter_free(ptr >>> 0, 1));
const WasmLinalgApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmlinalgapi_free(ptr >>> 0, 1));
const WasmLz78CodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmlz78code_free(ptr >>> 0, 1));
const WasmMarkovFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmarkov_free(ptr >>> 0, 1));
const WasmMultinomialFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmultinomial_free(ptr >>> 0, 1));
const WasmMultivariateNormalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmultivariatenormal_free(ptr >>> 0, 1));
const WasmMultivariateTFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmultivariatet_free(ptr >>> 0, 1));
const WasmNormalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmnormal_free(ptr >>> 0, 1));
const WasmPoissonFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpoisson_free(ptr >>> 0, 1));
const WasmPolynomialApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpolynomialapi_free(ptr >>> 0, 1));
const WasmPolynomialSolverFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpolynomialsolver_free(ptr >>> 0, 1));
const WasmRationalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrational_free(ptr >>> 0, 1));
const WasmRationalMatrixApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrationalmatrixapi_free(ptr >>> 0, 1));
const WasmRationalMatrixDtoApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrationalmatrixdtoapi_free(ptr >>> 0, 1));
const WasmRecurrenceRelationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrecurrencerelation_free(ptr >>> 0, 1));
const WasmReedSolomonFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmreedsolomon_free(ptr >>> 0, 1));
const WasmSignalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsignal_free(ptr >>> 0, 1));
const WasmSignalProcessingApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsignalprocessingapi_free(ptr >>> 0, 1));
const WasmSourceCodingApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsourcecodingapi_free(ptr >>> 0, 1));
const WasmSpectrumFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmspectrum_free(ptr >>> 0, 1));
const WasmStatisticsApiFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmstatisticsapi_free(ptr >>> 0, 1));
const WasmSvdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsvd_free(ptr >>> 0, 1));
const WasmSymbolicComplexFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsymboliccomplex_free(ptr >>> 0, 1));
const WasmSymbolicExprFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsymbolicexpr_free(ptr >>> 0, 1));
const WasmTFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmt_free(ptr >>> 0, 1));
const WasmUniformFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmuniform_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
