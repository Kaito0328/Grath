use std::cmp::Ordering;

use crate::prelude::*;
use algebraic::traits::{Field, Ring};
use num_complex::Complex;
use num_traits::Zero;

#[derive(Clone, Copy, Debug)]
pub enum RootMethod {
    JenkinsTraub,
    JenkinsTraubPure,
    JenkinsTraubHybrid,
    DurandKerner,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Root {
    pub value: Complex<f64>,
    pub multiplicity: usize,
}

impl Polynomial<f64> {
    pub fn to_complex(&self) -> Polynomial<Complex<f64>> {
        let complex_coeffs = self.coeffs.iter().map(|&c| Complex::new(c, 0.0)).collect();

        Polynomial::new(complex_coeffs)
    }

    pub fn find_roots(&self) -> Vec<Complex<f64>> {
        self.find_roots_with(RootMethod::JenkinsTraubHybrid)
    }

    pub fn find_roots_with(&self, method: RootMethod) -> Vec<Complex<f64>> {
        let deg = self.deg();
        if deg <= 4 && deg > 0 {
            let pc = self.to_complex();
            return match deg {
                1 => Self::find_roots_deg_1(pc.coeffs),
                2 => Self::find_roots_deg_2(pc.coeffs),
                3 => Self::find_roots_deg_3(pc.coeffs),
                4 => Self::find_roots_deg_4(pc.coeffs),
                _ => unreachable!(),
            };
        }
        match method {
            RootMethod::JenkinsTraub => Self::find_roots_jenkins_traub_hybrid(self),
            RootMethod::JenkinsTraubHybrid => Self::find_roots_jenkins_traub_hybrid(self),
            RootMethod::JenkinsTraubPure => Self::find_roots_jenkins_traub_pure(self),
            RootMethod::DurandKerner => Self::find_roots_durand_kerner(self),
        }
    }

    pub fn group_roots(roots: &[Complex<f64>], tolerance: f64) -> Vec<Root> {
        if roots.is_empty() {
            return vec![];
        }

        let mut sorted_roots = roots.to_vec();
        sorted_roots.sort_by(|a, b| match a.re.partial_cmp(&b.re) {
            Some(Ordering::Equal) => a.im.partial_cmp(&b.im).unwrap_or(Ordering::Equal),
            Some(ord) => ord,
            None => Ordering::Equal,
        });

        let mut grouped: Vec<Root> = Vec::new();
        for root in sorted_roots {
            if let Some(last) = grouped.last_mut() {
                if (last.value - root).norm() < tolerance {
                    let total_weight = last.multiplicity as f64 + 1.0;
                    last.value = (last.value * (last.multiplicity as f64) + root) / total_weight;
                    last.multiplicity += 1;
                    continue;
                }
            }

            grouped.push(Root {
                value: root,
                multiplicity: 1,
            });
        }
        grouped
    }

    fn find_roots_durand_kerner(p: &Self) -> Vec<Complex<f64>> {
        let n = p.deg();
        if n <= 0 {
            return Vec::new();
        }
        let mut pc = p.to_complex();
        let lc = pc.coeffs.last().cloned().unwrap_or_else(Complex::zero);
        if lc != Complex::new(1.0, 0.0) && lc != Complex::new(0.0, 0.0) {
            pc = &pc / &Polynomial::new(vec![lc]);
        }

        let n_usize = n as usize;
        let radius = 0.8f64;
        let mut roots: Vec<Complex<f64>> = (0..n_usize)
            .map(|k| {
                let theta = 2.0 * std::f64::consts::PI * (k as f64) / (n as f64);
                Complex::new(radius * theta.cos(), radius * theta.sin())
            })
            .collect();

        let max_iter = 256;
        let tol = 1e-12;
        for _ in 0..max_iter {
            let mut max_delta = 0.0;
            for i in 0..n_usize {
                let xi = roots[i];
                let fx = pc.eval(xi);
                let mut denom = Complex::new(1.0, 0.0);
                for (j, &xj) in roots.iter().enumerate() {
                    if i != j {
                        denom *= xi - xj;
                    }
                }
                if denom == Complex::new(0.0, 0.0) {
                    denom = Complex::new(1e-12, 0.0);
                }
                let delta = fx / denom;
                roots[i] -= delta;
                let d = delta.norm();
                if d > max_delta {
                    max_delta = d;
                }
            }
            if max_delta < tol {
                break;
            }
        }
        roots
    }

    fn find_roots_deg_1(p: Vec<Complex<f64>>) -> Vec<Complex<f64>> {
        let mut roots = Vec::new();
        if p.len() < 2 || p[1].is_zero() {
            return roots;
        }
        roots.push(-p[0] / p[1]);
        roots
    }

    fn find_roots_deg_2(p: Vec<Complex<f64>>) -> Vec<Complex<f64>> {
        let mut roots = Vec::new();
        if p.len() < 3 {
            return roots;
        }
        let c2 = p[2];
        let c1 = p[1];
        let c0 = p[0];
        let delta = (c1 * c1 - 4.0 * c2 * c0).sqrt();
        roots.push((-c1 + delta) / (2.0 * c2));
        roots.push((-c1 - delta) / (2.0 * c2));
        roots
    }

    fn find_roots_deg_3(p: Vec<Complex<f64>>) -> Vec<Complex<f64>> {
        if p.len() < 4 {
            return Vec::new();
        }
        let a3 = p[3];
        if a3 == Complex::new(0.0, 0.0) {
            return Vec::new();
        }
        let a2 = p[2];
        let a1 = p[1];
        let a0 = p[0];
        let inv = Complex::new(1.0, 0.0) / a3;
        let p2 = a2 * inv;
        let q2 = a1 * inv;
        let r2 = a0 * inv;
        let third = Complex::new(1.0 / 3.0, 0.0);
        let shift = p2 * third;
        let a_d = q2 - (p2 * p2) * third;
        let b_d = r2 - p2 * q2 * third
            + (Complex::new(2.0, 0.0) / Complex::new(27.0, 0.0)) * p2 * p2 * p2;
        let half = Complex::new(0.5, 0.0);
        let a3d = a_d / Complex::new(3.0, 0.0);
        let b2d = b_d * half;
        let discriminant = b2d * b2d + a3d * a3d * a3d;
        let mut roots = Vec::with_capacity(3);
        if discriminant == Complex::new(0.0, 0.0) {
            let c = cubic_root(-b2d);
            roots.push((Complex::new(2.0, 0.0) * c) - shift);
            roots.push((-c) - shift);
            roots.push((-c) - shift);
        } else {
            let sqrt_d = discriminant.sqrt();
            let u = cubic_root(-b2d + sqrt_d);
            let v = cubic_root(-b2d - sqrt_d);
            let omega = Complex::new(-0.5, (3.0f64).sqrt() / 2.0);
            let omega2 = Complex::new(-0.5, -(3.0f64).sqrt() / 2.0);
            let y1 = u + v;
            let y2 = omega * u + omega2 * v;
            let y3 = omega2 * u + omega * v;
            roots.push(y1 - shift);
            roots.push(y2 - shift);
            roots.push(y3 - shift);
        }
        roots
    }

    fn find_roots_deg_4(p: Vec<Complex<f64>>) -> Vec<Complex<f64>> {
        if p.len() < 5 {
            return Vec::new();
        }
        let a4 = p[4];
        if a4 == Complex::new(0.0, 0.0) {
            return Vec::new();
        }
        let a3 = p[3];
        let a2 = p[2];
        let a1 = p[1];
        let a0 = p[0];
        let inv = Complex::new(1.0, 0.0) / a4;
        let b = a3 * inv;
        let c = a2 * inv;
        let d = a1 * inv;
        let e = a0 * inv;
        let half = Complex::new(0.5, 0.0);
        let b2 = b * b;
        let b3 = b2 * b;
        let b4 = b2 * b2;
        let p_ = c - (Complex::new(3.0, 0.0) / Complex::new(8.0, 0.0)) * b2;
        let q_ = d - (Complex::new(1.0, 0.0) / Complex::new(2.0, 0.0)) * b * c
            + (Complex::new(1.0, 0.0) / Complex::new(8.0, 0.0)) * b3;
        let r_ = e - (Complex::new(1.0, 0.0) / Complex::new(4.0, 0.0)) * b * d
            + (Complex::new(1.0, 0.0) / Complex::new(16.0, 0.0)) * b2 * c
            - (Complex::new(3.0, 0.0) / Complex::new(256.0, 0.0)) * b4;

        if q_.norm() < 1e-14 {
            let quad = vec![r_, p_, Complex::new(1.0, 0.0)];
            let z_roots = Self::find_roots_deg_2(quad);
            let mut roots = Vec::new();
            for z in z_roots {
                let s = z.sqrt();
                roots.push(s - b / Complex::new(4.0f64, 0.0f64));
                roots.push(-s - b / Complex::new(4.0f64, 0.0f64));
            }
            return roots;
        }
        let p_half = p_ / Complex::new(2.0, 0.0);
        let term = (Complex::new(4.0, 0.0) * r_ * p_ - q_ * q_) / Complex::new(8.0, 0.0);
        let z_roots = Self::find_roots_deg_3(vec![term, -r_, -p_half, Complex::new(1.0, 0.0)]);
        let z0 = z_roots[0];
        let big_r = (z0 * z0 - r_ + p_ * z0).sqrt();
        let big_s = if big_r == Complex::new(0.0, 0.0) {
            Complex::new(0.0, 0.0)
        } else {
            (Complex::new(2.0, 0.0) * z0 - p_ - q_ / big_r).sqrt() / Complex::new(2.0, 0.0)
        };
        let big_t = if big_r == Complex::new(0.0, 0.0) {
            Complex::new(0.0, 0.0)
        } else {
            (Complex::new(2.0, 0.0) * z0 - p_ + q_ / big_r).sqrt() / Complex::new(2.0, 0.0)
        };
        let shift = b / Complex::new(4.0, 0.0);
        let roots = vec![
            -shift + half * (big_r + (big_s + big_t)),
            -shift + half * (big_r - (big_s + big_t)),
            -shift + half * (-big_r + (big_s - big_t)),
            -shift + half * (-big_r - (big_s - big_t)),
        ];
        roots
    }

    fn to_monic_complex(p: &Self) -> Polynomial<Complex<f64>> {
        let mut pc = p.to_complex();
        let lc = pc.coeffs.last().cloned().unwrap_or_else(Complex::zero);
        if lc != Complex::new(0.0, 0.0) && lc != Complex::new(1.0, 0.0) {
            pc = &pc / &Polynomial::new(vec![lc]);
        }
        pc
    }

    fn newton_polish(
        p: &Polynomial<Complex<f64>>,
        mut z: Complex<f64>,
        max_iter: usize,
        tol: f64,
    ) -> Complex<f64> {
        let d = p.differentiate();
        for _ in 0..max_iter {
            let f = p.eval(z);
            if f.norm() < tol {
                break;
            }
            let fp = d.eval(z);
            if fp == Complex::new(0.0, 0.0) {
                break;
            }
            z -= f / fp;
        }
        z
    }

    fn deflate_with_estimate(
        mut p: Polynomial<Complex<f64>>,
        s: Complex<f64>,
        real_thr: f64,
        roots: &mut Vec<Complex<f64>>,
    ) -> Polynomial<Complex<f64>> {
        if s.im.abs() < real_thr {
            let s_real = Complex::new(s.re, 0.0f64);
            roots.push(s_real);
            let s_real_poly: Polynomial<Complex<f64>> =
                Polynomial::new(vec![-s_real, Complex::new(1.0f64, 0.0f64)]);
            let (np, _r) = p.div_rem(&s_real_poly);
            p = np.monic();
        } else {
            let sc = s.conj();
            roots.push(s);
            roots.push(sc);
            let s_complex_poly: Polynomial<Complex<f64>> =
                Polynomial::new(vec![s * sc, -(s + sc), Complex::new(1.0f64, 0.0f64)]);
            let (np, _r) = p.div_rem(&s_complex_poly);
            p = np.monic();
        }
        p
    }

    fn finish_low_degree(p: Polynomial<Complex<f64>>, roots: &mut Vec<Complex<f64>>) {
        if p.deg() == 2 {
            roots.extend(Self::find_roots_deg_2(p.coeffs));
        } else if p.deg() == 1 {
            roots.extend(Self::find_roots_deg_1(p.coeffs));
        }
    }

    fn find_roots_jenkins_traub_hybrid(p: &Self) -> Vec<Complex<f64>> {
        let deg = p.deg();
        if deg <= 0 {
            return Vec::new();
        }
        let mut roots = Vec::with_capacity(deg as usize);
        let mut pc = Self::to_monic_complex(p);

        let real_poly = Polynomial::new(pc.coeffs.iter().map(|c| c.re).collect::<Vec<f64>>());
        let mut seeds = Self::find_roots_durand_kerner(&real_poly);
        if seeds.is_empty() {
            return Self::find_roots_jenkins_traub_pure(p);
        }

        let tol = 1e-12;
        let real_thr = 1e-10;
        while pc.deg() > 2 {
            seeds.sort_by(|a, b| {
                pc.eval(*a)
                    .norm()
                    .partial_cmp(&pc.eval(*b).norm())
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
            let mut s = seeds.remove(0);
            s = Self::newton_polish(&pc, s, 50, tol);
            pc = Self::deflate_with_estimate(pc, s, real_thr, &mut roots);
            seeds.retain(|z| (*z - s).norm() > 1e-6 && (*z - s.conj()).norm() > 1e-6);
        }
        Self::finish_low_degree(pc, &mut roots);
        roots
    }

    fn find_roots_jenkins_traub_pure(p: &Self) -> Vec<Complex<f64>> {
        let deg = p.deg();
        if deg <= 0 {
            return Vec::new();
        }
        let mut roots = Vec::with_capacity(deg as usize);

        let mut p = Self::to_monic_complex(p);

        let max_ratio = p
            .coeffs
            .iter()
            .take(p.coeffs.len().saturating_sub(1))
            .map(|c| c.norm())
            .fold(0.0f64, f64::max);
        let root_bound = 1.0 + max_ratio;

        const NO_SHIFT_ITER: usize = 5;
        const REAL_THRESHOLD: f64 = 1e-10;

        let mut guard = 0usize;
        let mut stagnation = 0usize;
        while p.deg() > 2 {
            let deg_before = p.deg();
            let mut h: Polynomial<Complex<f64>> = p.differentiate();
            for _ in 0..NO_SHIFT_ITER {
                h = Self::calc_h_lambda(&p, &h, &Complex::zero());
            }

            const MAX_TRIES: usize = 5;
            const EPS_ACCEPT: f64 = 1e-8;
            let mut best_s = Complex::new(0.0, 0.0);
            let mut best_res = f64::INFINITY;

            for tri in 0..MAX_TRIES {
                let candidates = 12usize;
                let radius = root_bound.clamp(0.5, 10.0) * (1.0 + 0.05 * (tri as f64));
                let mut s = Complex::new(1.0, 0.0);
                let mut best_metric = f64::INFINITY;
                for k in 0..candidates {
                    let theta = 2.0 * std::f64::consts::PI * (k as f64) / (candidates as f64);
                    let s0 = Complex::new(radius * theta.cos(), radius * theta.sin());
                    let pe = p.eval(s0);
                    let he = h.eval(s0);
                    let metric = if he == Complex::new(0.0, 0.0) {
                        f64::INFINITY
                    } else {
                        (pe / he).norm()
                    };
                    if metric < best_metric && metric.is_finite() {
                        best_metric = metric;
                        s = s0;
                    }
                }

                for _ in 0..20 {
                    h = Self::calc_h_lambda(&p, &h, &s);
                    let he = h.eval(s);
                    if he == Complex::new(0.0, 0.0) {
                        break;
                    }
                    let t = s - p.eval(s) / he;
                    if (t - s).norm() < 1e-8 {
                        s = t;
                        break;
                    }
                    s = t;
                }

                for _ in 0..10 {
                    let p_s = p.eval(s);
                    if p_s.norm() < EPS_ACCEPT {
                        break;
                    }
                    h = Self::calc_h_lambda(&p, &h, &s);
                    let he = h.eval(s);
                    if he == Complex::new(0.0, 0.0) {
                        break;
                    }
                    s -= p_s / he;
                }

                for _ in 0..3 {
                    let p_s = p.eval(s);
                    if p_s.norm() < EPS_ACCEPT {
                        break;
                    }
                    let he = h.eval(s);
                    if he == Complex::new(0.0, 0.0) {
                        break;
                    }
                    s -= p_s / he;
                }

                let res = p.eval(s).norm();
                if res < best_res {
                    best_res = res;
                    best_s = s;
                }
                if res < EPS_ACCEPT {
                    break;
                }

                let jitter = Complex::new(1e-3 * (tri as f64 + 1.0), -1e-3 * (tri as f64 + 1.0));
                s += jitter;
            }

            p = Self::deflate_with_estimate(p, best_s, REAL_THRESHOLD, &mut roots);

            guard += 1;
            if guard > 50 {
                break;
            }
            if p.deg() >= deg_before {
                stagnation += 1;
            } else {
                stagnation = 0;
            }
            if stagnation >= 3 {
                break;
            }
        }

        Self::finish_low_degree(p, &mut roots);
        roots
    }

    fn calc_h_lambda(
        p_complex: &Polynomial<Complex<f64>>,
        h_before: &Polynomial<Complex<f64>>,
        shift: &Complex<f64>,
    ) -> Polynomial<Complex<f64>> {
        let mut denom = p_complex.eval(*shift);
        if denom == Complex::new(0.0, 0.0) {
            let eps = Complex::new(1e-12, 1e-12);
            denom = p_complex.eval(*shift + eps);
        }
        let ratio = h_before.eval(*shift) / denom;
        let ratio_poly = Polynomial::new(vec![ratio]);
        let poly_dividend = h_before - &(p_complex * &ratio_poly);
        let poly_divisor = Polynomial::new(vec![-*shift, Complex::new(1.0, 0.0)]);
        &poly_dividend / &poly_divisor
    }
}

fn cubic_root(z: Complex<f64>) -> Complex<f64> {
    if z == Complex::new(0.0, 0.0) {
        return z;
    }
    let r = z.norm();
    let theta = z.arg();
    let root_r = r.powf(1.0 / 3.0);
    let root_theta = theta / 3.0;
    Complex::from_polar(root_r, root_theta)
}
