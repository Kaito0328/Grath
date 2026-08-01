use crate::algebraic_dto::{
    expr_from_dto, expr_to_dto, rational_from_dto, NumericComplexDto, RationalDto, SymbolicExprDto,
};
use algebraic::prelude::*;
use concrete_math::combinatorics::polynomials;
use concrete_math::sequence::core::{ClosedForm, GeneralTerm};
use concrete_math::sequence::recurrence_relation::RecurrenceRelation;
use concrete_math::sum::discrete as discrete_calc;
use concrete_math::sum::partial_sum as partial_sum_calc;
use concrete_math::symbolic::recurrence;
use concrete_math::symbolic::sums as symbolic_sums;
use num_complex::Complex;
use polynomial::core::Polynomial;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn cm_falling_factorial_poly(m: usize) -> JsValue {
    let p = polynomials::falling_factorial_poly(m);
    let coeffs: Vec<NumericComplexDto> = p
        .coeffs
        .iter()
        .map(|c| NumericComplexDto { re: c.re, im: c.im })
        .collect();
    serde_wasm_bindgen::to_value(&coeffs).unwrap()
}

#[wasm_bindgen]
pub fn cm_rising_factorial_poly(m: usize) -> JsValue {
    let p = polynomials::rising_factorial_poly(m);
    let coeffs: Vec<NumericComplexDto> = p
        .coeffs
        .iter()
        .map(|c| NumericComplexDto { re: c.re, im: c.im })
        .collect();
    serde_wasm_bindgen::to_value(&coeffs).unwrap()
}

#[wasm_bindgen]
pub fn cm_binom_x_plus_k_choose_k_poly(k: usize) -> JsValue {
    let p = polynomials::binom_x_plus_k_choose_k_poly(k);
    let coeffs: Vec<NumericComplexDto> = p
        .coeffs
        .iter()
        .map(|c| NumericComplexDto { re: c.re, im: c.im })
        .collect();
    serde_wasm_bindgen::to_value(&coeffs).unwrap()
}

#[derive(Serialize, Deserialize)]
pub struct GeneralTermDto {
    pub polynomial: Vec<NumericComplexDto>,
    pub base: NumericComplexDto,
}

#[derive(Serialize, Deserialize)]
pub struct ClosedFormDto {
    pub terms: Vec<GeneralTermDto>,
}

fn dto_to_closed_form(dto: ClosedFormDto) -> ClosedForm {
    ClosedForm {
        terms: dto
            .terms
            .into_iter()
            .map(|t| GeneralTerm {
                polynomial: Polynomial::new(
                    t.polynomial
                        .into_iter()
                        .map(|c| Complex::new(c.re, c.im))
                        .collect(),
                ),
                base: Complex::new(t.base.re, t.base.im),
            })
            .collect(),
    }
}

pub(crate) fn closed_form_to_dto(cf: &ClosedForm) -> ClosedFormDto {
    ClosedFormDto {
        terms: cf
            .terms
            .iter()
            .map(|t| GeneralTermDto {
                polynomial: t
                    .polynomial
                    .coeffs
                    .iter()
                    .map(|c| NumericComplexDto { re: c.re, im: c.im })
                    .collect(),
                base: NumericComplexDto {
                    re: t.base.re,
                    im: t.base.im,
                },
            })
            .collect(),
    }
}

#[wasm_bindgen]
pub fn solve_recurrence(
    coeffs: Vec<f64>,
    initials: Vec<f64>,
    non_homogeneous_value: JsValue,
) -> Result<JsValue, JsError> {
    let non_homogeneous: Vec<GeneralTermDto> =
        if non_homogeneous_value.is_undefined() || non_homogeneous_value.is_null() {
            Vec::new()
        } else {
            serde_wasm_bindgen::from_value(non_homogeneous_value)
                .map_err(|e| JsError::new(&e.to_string()))?
        };

    let nh_terms: Vec<GeneralTerm> = non_homogeneous
        .into_iter()
        .map(|t| GeneralTerm {
            polynomial: Polynomial::new(
                t.polynomial
                    .into_iter()
                    .map(|c| Complex::new(c.re, c.im))
                    .collect(),
            ),
            base: Complex::new(t.base.re, t.base.im),
        })
        .collect();

    let rr = RecurrenceRelation::new(coeffs, nh_terms, initials);
    let cf = rr.solve();
    let dto = closed_form_to_dto(&cf);
    serde_wasm_bindgen::to_value(&dto).map_err(|e| JsError::new(&e.to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct NonHomogeneousSymbolicDto {
    pub poly: Vec<SymbolicExprDto>,
    pub base: RationalDto,
}

#[wasm_bindgen]
pub fn solve_recurrence_symbolic(
    coeffs_value: JsValue,          // Vec<RationalDto>
    initials_value: JsValue,        // Vec<SymbolicExprDto>
    non_homogeneous_value: JsValue, // Vec<NonHomogeneousSymbolicDto>
) -> Result<JsValue, JsError> {
    let coeffs_dto: Vec<RationalDto> =
        serde_wasm_bindgen::from_value(coeffs_value).map_err(|e| JsError::new(&e.to_string()))?;
    let initials_dto: Vec<SymbolicExprDto> =
        serde_wasm_bindgen::from_value(initials_value).map_err(|e| JsError::new(&e.to_string()))?;

    let coeffs: Vec<Rational> = coeffs_dto
        .iter()
        .map(|d| rational_from_dto(d))
        .collect::<Result<Vec<_>, _>>()?;
    let initials: Vec<SymbolicExpr> = initials_dto
        .iter()
        .map(|d| expr_from_dto(d))
        .collect::<Result<Vec<_>, _>>()?;

    let nh_dto: Vec<NonHomogeneousSymbolicDto> =
        if non_homogeneous_value.is_undefined() || non_homogeneous_value.is_null() {
            Vec::new()
        } else {
            serde_wasm_bindgen::from_value(non_homogeneous_value)
                .map_err(|e| JsError::new(&e.to_string()))?
        };

    let mut nh_terms = Vec::with_capacity(nh_dto.len());
    for item in nh_dto {
        let p: Vec<SymbolicExpr> = item
            .poly
            .iter()
            .map(|d| expr_from_dto(d))
            .collect::<Result<Vec<_>, _>>()?;
        let q = rational_from_dto(&item.base)?;
        nh_terms.push((p, q));
    }

    let res = if nh_terms.is_empty() {
        recurrence::solve_homogeneous(coeffs, initials)
    } else {
        recurrence::solve_inhomogeneous_arith_geom_multiple(coeffs, initials, nh_terms)
    };

    let res_dto = expr_to_dto(&res);
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn format_closed_form(dto_value: JsValue) -> Result<String, JsError> {
    let dto: ClosedFormDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(|e| JsError::new(&e.to_string()))?;
    let cf = dto_to_closed_form(dto);
    Ok(cf.display().to_string())
}

#[wasm_bindgen]
pub fn eval_closed_form(dto_value: JsValue, n: u32) -> Result<JsValue, JsError> {
    let dto: ClosedFormDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(|e| JsError::new(&e.to_string()))?;
    let cf = dto_to_closed_form(dto);
    let res = cf.term(n);
    let res_dto = NumericComplexDto {
        re: res.re,
        im: res.im,
    };
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}
#[wasm_bindgen]
pub fn eval_recurrence_iterative(
    coeffs: Vec<f64>,
    initials: Vec<f64>,
    non_homogeneous_value: JsValue,
    n: u32,
) -> Result<JsValue, JsError> {
    let non_homogeneous: Vec<GeneralTermDto> =
        if non_homogeneous_value.is_undefined() || non_homogeneous_value.is_null() {
            Vec::new()
        } else {
            serde_wasm_bindgen::from_value(non_homogeneous_value)
                .map_err(|e| JsError::new(&e.to_string()))?
        };

    let nh_terms: Vec<GeneralTerm> = non_homogeneous
        .into_iter()
        .map(|t| GeneralTerm {
            polynomial: Polynomial::new(
                t.polynomial
                    .into_iter()
                    .map(|c| Complex::new(c.re, c.im))
                    .collect(),
            ),
            base: Complex::new(t.base.re, t.base.im),
        })
        .collect();

    let k = coeffs.len();
    if (n as usize) < initials.len() {
        let res = initials[n as usize];
        let res_dto = NumericComplexDto { re: res, im: 0.0 };
        return serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()));
    }

    let mut values: Vec<Complex<f64>> =
        initials.into_iter().map(|v| Complex::new(v, 0.0)).collect();
    if values.len() < k {
        values.resize(k, Complex::new(0.0, 0.0));
    }

    for i in (values.len() as u32)..=n {
        let mut next = Complex::new(0.0, 0.0);
        for (j, &c) in coeffs.iter().enumerate() {
            next += values[values.len() - 1 - j] * c;
        }
        for nh in &nh_terms {
            next += nh.polynomial.eval(Complex::new(i as f64, 0.0)) * nh.base.powu(i);
        }
        values.push(next);
        if values.len() > k {
            values.remove(0);
        }
    }

    let res = values.last().cloned().unwrap_or(Complex::new(0.0, 0.0));
    let res_dto = NumericComplexDto {
        re: res.re,
        im: res.im,
    };
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn discrete_diff(poly_coeffs: Vec<JsValue>) -> Result<JsValue, JsError> {
    let poly_coeffs_parsed: Vec<NumericComplexDto> = poly_coeffs
        .into_iter()
        .map(|v| serde_wasm_bindgen::from_value(v))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let p = Polynomial::new(
        poly_coeffs_parsed
            .into_iter()
            .map(|c| Complex::new(c.re, c.im))
            .collect(),
    );
    let res = discrete_calc::discrete_diff(&p);
    let res_coeffs: Vec<NumericComplexDto> = res
        .coeffs
        .iter()
        .map(|c| NumericComplexDto { re: c.re, im: c.im })
        .collect();
    serde_wasm_bindgen::to_value(&res_coeffs).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn discrete_sum(poly_coeffs: Vec<JsValue>) -> Result<JsValue, JsError> {
    let poly_coeffs_parsed: Vec<NumericComplexDto> = poly_coeffs
        .into_iter()
        .map(|v| serde_wasm_bindgen::from_value(v))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let p = Polynomial::new(
        poly_coeffs_parsed
            .into_iter()
            .map(|c| Complex::new(c.re, c.im))
            .collect(),
    );
    let res = discrete_calc::discrete_sum(&p);
    let res_coeffs: Vec<NumericComplexDto> = res
        .coeffs
        .iter()
        .map(|c| NumericComplexDto { re: c.re, im: c.im })
        .collect();
    serde_wasm_bindgen::to_value(&res_coeffs).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn partial_sum(dto_value: JsValue) -> Result<JsValue, JsError> {
    let dto: ClosedFormDto =
        serde_wasm_bindgen::from_value(dto_value).map_err(|e| JsError::new(&e.to_string()))?;
    let cf = dto_to_closed_form(dto);
    let res = partial_sum_calc::partial_sum(&cf);
    let res_dto = closed_form_to_dto(&res);
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn geometric_sum(r_value: JsValue, n_value: JsValue) -> Result<JsValue, JsError> {
    let r = expr_from_dto(&serde_wasm_bindgen::from_value(r_value)?)?;
    let n = expr_from_dto(&serde_wasm_bindgen::from_value(n_value)?)?;
    let res = symbolic_sums::geometric_sum(r, n);
    let res_dto = expr_to_dto(&res);
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn arithmetic_sum(
    a0_value: JsValue,
    d_value: JsValue,
    n_value: JsValue,
) -> Result<JsValue, JsError> {
    let a0 = expr_from_dto(&serde_wasm_bindgen::from_value(a0_value)?)?;
    let d = expr_from_dto(&serde_wasm_bindgen::from_value(d_value)?)?;
    let n = expr_from_dto(&serde_wasm_bindgen::from_value(n_value)?)?;
    let res = symbolic_sums::arithmetic_sum(a0, d, n);
    let res_dto = expr_to_dto(&res);
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn arith_geom_sum(
    a0_value: JsValue,
    d_value: JsValue,
    r_value: JsValue,
    n_value: JsValue,
) -> Result<JsValue, JsError> {
    let a0 = expr_from_dto(&serde_wasm_bindgen::from_value(a0_value)?)?;
    let d = expr_from_dto(&serde_wasm_bindgen::from_value(d_value)?)?;
    let r = expr_from_dto(&serde_wasm_bindgen::from_value(r_value)?)?;
    let n = expr_from_dto(&serde_wasm_bindgen::from_value(n_value)?)?;
    let res = symbolic_sums::arith_geom_sum(a0, d, r, n);
    let res_dto = expr_to_dto(&res);
    serde_wasm_bindgen::to_value(&res_dto).map_err(|e| JsError::new(&e.to_string()))
}
