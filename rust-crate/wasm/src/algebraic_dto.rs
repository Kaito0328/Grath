use ::common::prelude::{AppError, ToAppError};
use algebraic::error::AlgebraicError;
use algebraic::prelude::*;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

fn js_error_from_app_error(app: AppError) -> JsError {
    let json =
        serde_json::to_string(&app).unwrap_or_else(|_| format!("{}: {}", app.code, app.message));
    JsError::new(&json)
}

fn js_error_from_to_app_error<E: ToAppError>(e: E, details: Option<String>) -> JsError {
    js_error_from_app_error(e.to_app_error(details))
}

fn details_from_algebraic_error(e: &AlgebraicError) -> Option<String> {
    match e {
        AlgebraicError::UnexpectedToken { expected, found } => Some(
            serde_json::json!({
                "expected": expected,
                // Token is not necessarily serializable; keep a stable debug representation.
                "found": format!("{found:?}"),
            })
            .to_string(),
        ),
        _ => None,
    }
}

fn js_error_from_serde(err: serde_wasm_bindgen::Error) -> JsError {
    JsError::new(&err.to_string())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RationalDto {
    pub numer: String,
    pub denom: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "kind")]
pub enum SymbolicExprDto {
    Rational {
        numer: String,
        denom: String,
    },
    Symbol {
        name: String,
    },
    Add {
        terms: Vec<SymbolicExprDto>,
    },
    Mul {
        factors: Vec<SymbolicExprDto>,
    },
    Pow {
        base: Box<SymbolicExprDto>,
        exp: Box<SymbolicExprDto>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SymbolicComplexDto {
    pub re: SymbolicExprDto,
    pub im: SymbolicExprDto,
}

fn rational_to_dto(r: &Rational) -> RationalDto {
    RationalDto {
        numer: r.numer().to_string(),
        denom: r.denom().to_string(),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct NumericComplexDto {
    pub re: f64,
    pub im: f64,
}

pub(crate) fn expr_to_dto(e: &SymbolicExpr) -> SymbolicExprDto {
    match e {
        SymbolicExpr::Rational(r) => SymbolicExprDto::Rational {
            numer: r.numer().to_string(),
            denom: r.denom().to_string(),
        },
        SymbolicExpr::Symbol(name) => SymbolicExprDto::Symbol { name: name.clone() },
        SymbolicExpr::Add(terms) => SymbolicExprDto::Add {
            terms: terms.iter().map(expr_to_dto).collect(),
        },
        SymbolicExpr::Mul(factors) => SymbolicExprDto::Mul {
            factors: factors.iter().map(expr_to_dto).collect(),
        },
        SymbolicExpr::Pow(base, exp) => SymbolicExprDto::Pow {
            base: Box::new(expr_to_dto(base)),
            exp: Box::new(expr_to_dto(exp)),
        },
    }
}

pub(crate) fn complex_to_dto(c: &SymbolicComplex) -> SymbolicComplexDto {
    SymbolicComplexDto {
        re: expr_to_dto(&c.re),
        im: expr_to_dto(&c.im),
    }
}

fn i64_from_str(s: &str) -> Result<i64, JsError> {
    s.trim()
        .parse::<i64>()
        .map_err(|_| JsError::new("Invalid integer"))
}

fn u64_from_str(s: &str) -> Result<u64, JsError> {
    s.trim()
        .parse::<u64>()
        .map_err(|_| JsError::new("Invalid integer"))
}

pub(crate) fn rational_from_dto(dto: &RationalDto) -> Result<Rational, JsError> {
    let numer = i64_from_str(&dto.numer)?;
    let denom = i64_from_str(&dto.denom)?;
    Rational::try_new(numer, denom)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))
}

pub(crate) fn expr_from_dto(dto: &SymbolicExprDto) -> Result<SymbolicExpr, JsError> {
    match dto {
        SymbolicExprDto::Rational { numer, denom } => {
            let n = i64_from_str(numer)?;
            let d = i64_from_str(denom)?;
            let r = Rational::try_new(n, d).map_err(|e| {
                js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e)))
            })?;
            Ok(SymbolicExpr::Rational(r))
        }
        SymbolicExprDto::Symbol { name } => Ok(SymbolicExpr::Symbol(name.clone())),
        SymbolicExprDto::Add { terms } => Ok(SymbolicExpr::Add(
            terms
                .iter()
                .map(expr_from_dto)
                .collect::<Result<Vec<_>, _>>()?,
        )),
        SymbolicExprDto::Mul { factors } => Ok(SymbolicExpr::Mul(
            factors
                .iter()
                .map(expr_from_dto)
                .collect::<Result<Vec<_>, _>>()?,
        )),
        SymbolicExprDto::Pow { base, exp } => Ok(SymbolicExpr::Pow(
            Box::new(expr_from_dto(base)?),
            Box::new(expr_from_dto(exp)?),
        )),
    }
}

fn complex_from_dto(dto: &SymbolicComplexDto) -> Result<SymbolicComplex, JsError> {
    Ok(SymbolicComplex::new(
        expr_from_dto(&dto.re)?,
        expr_from_dto(&dto.im)?,
    ))
}

// Convention-based aliases used by the inspector-generated exports.
fn symbolic_expr_to_dto(e: &SymbolicExpr) -> SymbolicExprDto {
    expr_to_dto(e)
}

fn symbolic_expr_from_dto(dto: &SymbolicExprDto) -> Result<SymbolicExpr, JsError> {
    expr_from_dto(dto)
}

pub(crate) fn symbolic_complex_to_dto(c: &SymbolicComplex) -> SymbolicComplexDto {
    complex_to_dto(c)
}

fn symbolic_complex_from_dto(dto: &SymbolicComplexDto) -> Result<SymbolicComplex, JsError> {
    complex_from_dto(dto)
}

#[wasm_bindgen(js_name = rationalParseDto)]
pub fn rational_parse_dto(input: &str) -> Result<JsValue, JsError> {
    let rational = input
        .parse::<Rational>()
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&rational)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalParseDtoFromLatex)]
pub fn rational_parse_dto_from_latex(latex: &str) -> Result<JsValue, JsError> {
    let rational = Rational::from_latex(latex)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&rational)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalFormatDto)]
pub fn rational_format_dto(dto_value: JsValue) -> Result<String, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let rational = rational_from_dto(&dto)?;
    Ok(rational.to_string())
}

#[wasm_bindgen(js_name = rationalFormatDtoToLatex)]
pub fn rational_format_dto_to_latex(dto_value: JsValue) -> Result<String, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let rational = rational_from_dto(&dto)?;
    Ok(rational.to_latex())
}

#[wasm_bindgen(js_name = rationalSimplifyDto)]
pub fn rational_simplify_dto(dto_value: JsValue) -> Result<JsValue, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let rational = rational_from_dto(&dto)?.simplified();
    serde_wasm_bindgen::to_value(&rational_to_dto(&rational)).map_err(js_error_from_serde)
}

// Convenience: allow starting from text (frontends can also do parse -> simplify).
#[wasm_bindgen(js_name = rationalSimplifyDtoFromText)]
pub fn rational_simplify_dto_from_text(input: &str) -> Result<JsValue, JsError> {
    let rational = input
        .parse::<Rational>()
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?
        .simplified();
    serde_wasm_bindgen::to_value(&rational_to_dto(&rational)).map_err(js_error_from_serde)
}

// --- Rational DTO ops (B-1: return new DTOs / values, no wasm classes exposed) ---

#[wasm_bindgen(js_name = rationalTryNewDto)]
pub fn rational_try_new_dto(numer: i64, denom: i64) -> Result<JsValue, JsError> {
    let r = Rational::try_new(numer, denom)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&r)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalCreateDto)]
pub fn rational_create_dto(numer: i64, denom: i64) -> Result<JsValue, JsError> {
    // keep the same behavior as Rational::new/create on the Rust side
    let r = Rational::new(numer, denom);
    serde_wasm_bindgen::to_value(&rational_to_dto(&r)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalFromIntDto)]
pub fn rational_from_int_dto(n: i64) -> Result<JsValue, JsError> {
    let r = Rational::from_int(n);
    serde_wasm_bindgen::to_value(&rational_to_dto(&r)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalFromLatexDto)]
pub fn rational_from_latex_dto(latex: &str) -> Result<JsValue, JsError> {
    let r = Rational::from_latex(latex)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&r)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalToLatexDto)]
pub fn rational_to_latex_dto(dto_value: JsValue) -> Result<String, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let r = rational_from_dto(&dto)?;
    Ok(r.to_latex())
}

#[wasm_bindgen(js_name = rationalIsIntegerDto)]
pub fn rational_is_integer_dto(dto_value: JsValue) -> Result<bool, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let r = rational_from_dto(&dto)?;
    Ok(r.is_integer())
}

#[wasm_bindgen(js_name = rationalIsZeroDto)]
pub fn rational_is_zero_dto(dto_value: JsValue) -> Result<bool, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let r = rational_from_dto(&dto)?;
    Ok(r.is_zero())
}

#[wasm_bindgen(js_name = rationalIsOneDto)]
pub fn rational_is_one_dto(dto_value: JsValue) -> Result<bool, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let r = rational_from_dto(&dto)?;
    Ok(r.is_one())
}

#[wasm_bindgen(js_name = rationalIsMinusOneDto)]
pub fn rational_is_minus_one_dto(dto_value: JsValue) -> Result<bool, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let r = rational_from_dto(&dto)?;
    Ok(r.is_minus_one())
}

#[wasm_bindgen(js_name = rationalNormalizeDto)]
pub fn rational_normalize_dto(dto_value: JsValue) -> Result<JsValue, JsError> {
    let dto: RationalDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let mut r = rational_from_dto(&dto)?;
    r.normalize();
    serde_wasm_bindgen::to_value(&rational_to_dto(&r)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalCheckedAddDto)]
pub fn rational_checked_add_dto(a_value: JsValue, b_value: JsValue) -> Result<JsValue, JsError> {
    let a: RationalDto = serde_wasm_bindgen::from_value(a_value).map_err(js_error_from_serde)?;
    let b: RationalDto = serde_wasm_bindgen::from_value(b_value).map_err(js_error_from_serde)?;
    let aa = rational_from_dto(&a)?;
    let bb = rational_from_dto(&b)?;
    let out = aa
        .checked_add(bb)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalCheckedMulDto)]
pub fn rational_checked_mul_dto(a_value: JsValue, b_value: JsValue) -> Result<JsValue, JsError> {
    let a: RationalDto = serde_wasm_bindgen::from_value(a_value).map_err(js_error_from_serde)?;
    let b: RationalDto = serde_wasm_bindgen::from_value(b_value).map_err(js_error_from_serde)?;
    let aa = rational_from_dto(&a)?;
    let bb = rational_from_dto(&b)?;
    let out = aa
        .checked_mul(bb)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = rationalCheckedDivDto)]
pub fn rational_checked_div_dto(a_value: JsValue, b_value: JsValue) -> Result<JsValue, JsError> {
    let a: RationalDto = serde_wasm_bindgen::from_value(a_value).map_err(js_error_from_serde)?;
    let b: RationalDto = serde_wasm_bindgen::from_value(b_value).map_err(js_error_from_serde)?;
    let aa = rational_from_dto(&a)?;
    let bb = rational_from_dto(&b)?;
    let out = aa
        .checked_div(bb)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&rational_to_dto(&out)).map_err(js_error_from_serde)
}

// --- SymbolicExpr DTO ---

#[wasm_bindgen(js_name = symbolicExprParseDto)]
pub fn symbolic_expr_parse_dto(input: &str) -> Result<JsValue, JsError> {
    let expr = input
        .parse::<SymbolicExpr>()
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&expr_to_dto(&expr)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprParseDtoFromLatex)]
pub fn symbolic_expr_parse_dto_from_latex(latex: &str) -> Result<JsValue, JsError> {
    let expr = SymbolicExpr::from_latex(latex)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&expr_to_dto(&expr)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprFormatDto)]
pub fn symbolic_expr_format_dto(dto_value: JsValue) -> Result<String, JsError> {
    let dto: SymbolicExprDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let expr = expr_from_dto(&dto)?;
    Ok(expr.to_string())
}

#[wasm_bindgen(js_name = symbolicExprFormatDtoToLatex)]
pub fn symbolic_expr_format_dto_to_latex(dto_value: JsValue) -> Result<String, JsError> {
    let dto: SymbolicExprDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let expr = expr_from_dto(&dto)?;
    Ok(expr.to_latex())
}

#[wasm_bindgen(js_name = symbolicExprSimplifyDto)]
pub fn symbolic_expr_simplify_dto(dto_value: JsValue) -> Result<JsValue, JsError> {
    let dto: SymbolicExprDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let expr = expr_from_dto(&dto)?.simplify();
    serde_wasm_bindgen::to_value(&expr_to_dto(&expr)).map_err(js_error_from_serde)
}

// --- SymbolicExpr DTO ops ---

#[wasm_bindgen(js_name = symbolicExprRationalDto)]
pub fn symbolic_expr_rational_dto(n: i64, d: i64) -> Result<JsValue, JsError> {
    let r = Rational::try_new(n, d)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    let e = SymbolicExpr::Rational(r);
    serde_wasm_bindgen::to_value(&expr_to_dto(&e)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprIntDto)]
pub fn symbolic_expr_int_dto(n: i64) -> Result<JsValue, JsError> {
    let e = SymbolicExpr::int(n);
    serde_wasm_bindgen::to_value(&expr_to_dto(&e)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprSqrt2Dto)]
pub fn symbolic_expr_sqrt2_dto() -> Result<JsValue, JsError> {
    let e = SymbolicExpr::sqrt2();
    serde_wasm_bindgen::to_value(&expr_to_dto(&e)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprAddDto)]
pub fn symbolic_expr_add_dto(terms_value: JsValue) -> Result<JsValue, JsError> {
    let terms: Vec<SymbolicExprDto> =
        serde_wasm_bindgen::from_value(terms_value).map_err(js_error_from_serde)?;
    let terms_expr = terms
        .iter()
        .map(expr_from_dto)
        .collect::<Result<Vec<_>, _>>()?;
    let out = SymbolicExpr::add(terms_expr);
    serde_wasm_bindgen::to_value(&expr_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprMulDto)]
pub fn symbolic_expr_mul_dto(factors_value: JsValue) -> Result<JsValue, JsError> {
    let factors: Vec<SymbolicExprDto> =
        serde_wasm_bindgen::from_value(factors_value).map_err(js_error_from_serde)?;
    let factors_expr = factors
        .iter()
        .map(expr_from_dto)
        .collect::<Result<Vec<_>, _>>()?;
    let out = SymbolicExpr::mul(factors_expr);
    serde_wasm_bindgen::to_value(&expr_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicExprPowDto)]
pub fn symbolic_expr_pow_dto(base_value: JsValue, exp_value: JsValue) -> Result<JsValue, JsError> {
    let base: SymbolicExprDto =
        serde_wasm_bindgen::from_value(base_value).map_err(js_error_from_serde)?;
    let exp: SymbolicExprDto =
        serde_wasm_bindgen::from_value(exp_value).map_err(js_error_from_serde)?;
    let b = expr_from_dto(&base)?;
    let e = expr_from_dto(&exp)?;
    let out = SymbolicExpr::pow(b, e);
    serde_wasm_bindgen::to_value(&expr_to_dto(&out)).map_err(js_error_from_serde)
}

// --- SymbolicComplex DTO ---

#[wasm_bindgen(js_name = symbolicComplexParseDto)]
pub fn symbolic_complex_parse_dto(input: &str) -> Result<JsValue, JsError> {
    let c = input
        .parse::<SymbolicComplex>()
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&complex_to_dto(&c)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexParseDtoFromLatex)]
pub fn symbolic_complex_parse_dto_from_latex(latex: &str) -> Result<JsValue, JsError> {
    let c = SymbolicComplex::from_latex(latex)
        .map_err(|e| js_error_from_app_error(e.to_app_error(details_from_algebraic_error(&e))))?;
    serde_wasm_bindgen::to_value(&complex_to_dto(&c)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexFormatDto)]
pub fn symbolic_complex_format_dto(dto_value: JsValue) -> Result<String, JsError> {
    let dto: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let c = complex_from_dto(&dto)?;
    Ok(c.to_string())
}

#[wasm_bindgen(js_name = symbolicComplexFormatDtoToLatex)]
pub fn symbolic_complex_format_dto_to_latex(dto_value: JsValue) -> Result<String, JsError> {
    let dto: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let c = complex_from_dto(&dto)?;
    Ok(c.to_latex())
}

#[wasm_bindgen(js_name = symbolicComplexSimplifyDto)]
pub fn symbolic_complex_simplify_dto(dto_value: JsValue) -> Result<JsValue, JsError> {
    let dto: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let mut c = complex_from_dto(&dto)?;
    c.re = c.re.simplify();
    c.im = c.im.simplify();
    serde_wasm_bindgen::to_value(&complex_to_dto(&c)).map_err(js_error_from_serde)
}

// --- SymbolicComplex DTO ops ---

#[wasm_bindgen(js_name = symbolicComplexNewDto)]
pub fn symbolic_complex_new_dto(re_value: JsValue, im_value: JsValue) -> Result<JsValue, JsError> {
    let re: SymbolicExprDto =
        serde_wasm_bindgen::from_value(re_value).map_err(js_error_from_serde)?;
    let im: SymbolicExprDto =
        serde_wasm_bindgen::from_value(im_value).map_err(js_error_from_serde)?;
    let z = SymbolicComplex::new(expr_from_dto(&re)?, expr_from_dto(&im)?);
    serde_wasm_bindgen::to_value(&complex_to_dto(&z)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexFromRealDto)]
pub fn symbolic_complex_from_real_dto(re_value: JsValue) -> Result<JsValue, JsError> {
    let re: SymbolicExprDto =
        serde_wasm_bindgen::from_value(re_value).map_err(js_error_from_serde)?;
    let z = SymbolicComplex::from_real(expr_from_dto(&re)?);
    serde_wasm_bindgen::to_value(&complex_to_dto(&z)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexIDto)]
pub fn symbolic_complex_i_dto() -> Result<JsValue, JsError> {
    let z = SymbolicComplex::i();
    serde_wasm_bindgen::to_value(&complex_to_dto(&z)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexZeroDto)]
pub fn symbolic_complex_zero_dto() -> Result<JsValue, JsError> {
    let z = SymbolicComplex::zero();
    serde_wasm_bindgen::to_value(&complex_to_dto(&z)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexIsRealDto)]
pub fn symbolic_complex_is_real_dto(dto_value: JsValue) -> Result<bool, JsError> {
    let dto: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let z = complex_from_dto(&dto)?;
    Ok(z.is_real())
}

#[wasm_bindgen(js_name = symbolicComplexIsImagPureDto)]
pub fn symbolic_complex_is_imag_pure_dto(dto_value: JsValue) -> Result<bool, JsError> {
    let dto: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let z = complex_from_dto(&dto)?;
    Ok(z.is_imag_pure())
}

#[wasm_bindgen(js_name = symbolicComplexNegDto)]
pub fn symbolic_complex_neg_dto(dto_value: JsValue) -> Result<JsValue, JsError> {
    let dto: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(js_error_from_serde)?;
    let z = complex_from_dto(&dto)?;
    let out = z.neg();
    serde_wasm_bindgen::to_value(&complex_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexAddDto)]
pub fn symbolic_complex_add_dto(a_value: JsValue, b_value: JsValue) -> Result<JsValue, JsError> {
    let a: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(a_value).map_err(js_error_from_serde)?;
    let b: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(b_value).map_err(js_error_from_serde)?;
    let aa = complex_from_dto(&a)?;
    let bb = complex_from_dto(&b)?;
    let out = aa.add(&bb);
    serde_wasm_bindgen::to_value(&complex_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexSubDto)]
pub fn symbolic_complex_sub_dto(a_value: JsValue, b_value: JsValue) -> Result<JsValue, JsError> {
    let a: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(a_value).map_err(js_error_from_serde)?;
    let b: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(b_value).map_err(js_error_from_serde)?;
    let aa = complex_from_dto(&a)?;
    let bb = complex_from_dto(&b)?;
    let out = aa.sub(&bb);
    serde_wasm_bindgen::to_value(&complex_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexMulDto)]
pub fn symbolic_complex_mul_dto(a_value: JsValue, b_value: JsValue) -> Result<JsValue, JsError> {
    let a: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(a_value).map_err(js_error_from_serde)?;
    let b: SymbolicComplexDto =
        serde_wasm_bindgen::from_value(b_value).map_err(js_error_from_serde)?;
    let aa = complex_from_dto(&a)?;
    let bb = complex_from_dto(&b)?;
    let out = aa.mul(&bb);
    serde_wasm_bindgen::to_value(&complex_to_dto(&out)).map_err(js_error_from_serde)
}

#[wasm_bindgen(js_name = symbolicComplexSqrtRationalDto)]
pub fn symbolic_complex_sqrt_rational_dto(n: i64, d: i64) -> Result<JsValue, JsError> {
    let z = SymbolicComplex::sqrt_rational(n, d);
    serde_wasm_bindgen::to_value(&complex_to_dto(&z)).map_err(js_error_from_serde)
}

// --- Generated exports from api-specs/algebraic.json ---
// The inspector pipeline writes this file at build time.
// It adds extra DTO-friendly wrappers for methods not covered above.
include!("algebraic_dto.exports.generated.rs");
