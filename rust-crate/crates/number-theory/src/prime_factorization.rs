use finite_field::gfp::GFp;
use linalg::Matrix;
use num_bigint::{BigInt, ToBigInt};
use num_integer::Integer;
use num_traits::{One, Signed, ToPrimitive, Zero};
use rand::thread_rng;
use rand::Rng;
use std::collections::BTreeMap;

type GF2 = GFp<2>;

#[inline]
fn modmul_u128(a: u128, b: u128, m: u128) -> u128 {
    ((a % m) * (b % m)) % m
}

#[inline]
fn modpow_u128(mut a: u128, mut e: u128, m: u128) -> u128 {
    let mut r = 1u128;
    while e > 0 {
        if e & 1 == 1 {
            r = modmul_u128(r, a, m);
        }
        a = modmul_u128(a, a, m);
        e >>= 1;
    }
    r
}

/// Miller-Rabin primality test for u64.
pub fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 || n == 3 {
        return true;
    }
    if n % 2 == 0 || n % 3 == 0 {
        return false;
    }
    let mut d = n - 1;
    let mut s = 0u32;
    while d % 2 == 0 {
        d /= 2;
        s += 1;
    }
    let bases: [u64; 7] = [2, 325, 9375, 28178, 450775, 9780504, 1795265022];
    'next_base: for &a in bases.iter() {
        let mut x = modpow_u128((a as u128) % (n as u128), d as u128, n as u128);
        if x == 1 || x == (n as u128 - 1) {
            continue;
        }
        for _ in 1..s {
            x = modmul_u128(x, x, n as u128);
            if x == n as u128 - 1 {
                continue 'next_base;
            }
        }
        return false;
    }
    true
}

fn gcd_u64(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        a %= b;
        std::mem::swap(&mut a, &mut b);
    }
    a
}

fn pollards_rho_split(n: u64) -> (u64, u64) {
    if n % 2 == 0 {
        return (2, n / 2);
    }
    let mut rng = thread_rng();
    let f = |x: u128, c: u128, m: u128| -> u128 { (modmul_u128(x, x, m) + c) % m };
    loop {
        let c = rng.gen_range(1u64..n - 1) as u128;
        let mut x = rng.gen_range(0u64..n) as u128;
        let mut y = x;
        let m = n as u128;
        let mut d = 1u64;
        while d == 1 {
            x = f(x, c, m);
            y = f(f(y, c, m), c, m);
            let diff = x.abs_diff(y);
            d = gcd_u64(diff as u64, n);
            if d == n {
                break;
            }
        }
        if d > 1 && d < n {
            return (d, n / d);
        }
    }
}

pub fn factorize(n: u64) -> BTreeMap<u64, u32> {
    let mut factors = BTreeMap::new();
    if n < 2 {
        return factors;
    }
    factorize_into(n, &mut factors);
    factors
}

fn factorize_into(n: u64, factors: &mut BTreeMap<u64, u32>) {
    if n == 1 {
        return;
    }
    if is_prime(n) {
        *factors.entry(n).or_insert(0) += 1;
        return;
    }
    let (a, b) = pollards_rho_split(n);
    factorize_into(a, factors);
    factorize_into(b, factors);
}

// --- BigInt Support ---

pub fn is_prime_big(n: &BigInt) -> bool {
    if let Some(u) = n.to_u64() {
        return is_prime(u);
    }
    if n < &BigInt::from(2u32) {
        return false;
    }
    if n.is_even() {
        return n == &BigInt::from(2u32);
    }

    // Miller-Rabin for BigInt (probabilistic)
    let mut d = n - 1u32;
    let mut s = 0u32;
    while d.is_even() {
        d >>= 1;
        s += 1;
    }
    let bases = [2u32, 3, 5, 7, 11, 13, 17, 19, 23];
    'outer: for &a in &bases {
        let a_bi = BigInt::from(a);
        let mut x = a_bi.modpow(&d, n);
        if x.is_one() || x == n - 1u32 {
            continue;
        }
        for _ in 1..s {
            x = (&x * &x) % n;
            if x == n - 1u32 {
                continue 'outer;
            }
        }
        return false;
    }
    true
}

pub fn factorize_big(n: &BigInt) -> BTreeMap<BigInt, u32> {
    let mut factors = BTreeMap::new();
    if n < &BigInt::from(2u32) {
        return factors;
    }
    factorize_into_big(n, &mut factors);
    factors
}

fn factorize_into_big(n: &BigInt, factors: &mut BTreeMap<BigInt, u32>) {
    if n.is_one() {
        return;
    }
    if is_prime_big(n) {
        *factors.entry(n.clone()).or_insert(0) += 1;
        return;
    }
    // Try Pollard's rho first
    if let Some(d) = pollards_rho_big(n, 2000) {
        factorize_into_big(&d, factors);
        factorize_into_big(&(n / &d), factors);
        return;
    }
    // If n is large and Pollard fails, use Quadratic Sieve
    if n.bits() > 40 {
        if let Some(d) = quadratic_sieve(n) {
            factorize_into_big(&d, factors);
            factorize_into_big(&(n / &d), factors);
            return;
        }
    }
    // Fallback to naive or trial division for remaining (should not reach here for most cases)
    let mut rem = n.clone();
    let mut d = BigInt::from(2u32);
    while &d * &d <= rem {
        while (&rem % &d).is_zero() {
            *factors.entry(d.clone()).or_insert(0) += 1;
            rem /= &d;
        }
        d += 1u32;
    }
    if rem > BigInt::one() {
        *factors.entry(rem).or_insert(0) += 1;
    }
}

fn pollards_rho_big(n: &BigInt, max_iters: usize) -> Option<BigInt> {
    if n.is_even() {
        return Some(BigInt::from(2u32));
    }
    let mut rng = thread_rng();
    let one = BigInt::one();
    let f = |x: &BigInt, c: &BigInt, m: &BigInt| -> BigInt { (x * x + c) % m };
    for _ in 0..3 {
        let c = BigInt::from(rng.gen_range(1u64..=1_000_000u64));
        let mut x = BigInt::from(rng.gen_range(2u64..=1_000_000u64)) % n;
        let mut y = x.clone();
        let mut d = one.clone();
        for _ in 0..max_iters {
            x = f(&x, &c, n);
            y = f(&f(&y, &c, n), &c, n);
            d = (&x - &y).abs().gcd(n);
            if d > one {
                break;
            }
        }
        if d > one && &d < n {
            return Some(d);
        }
    }
    None
}

// --- Quadratic Sieve ---

struct Relation {
    x: BigInt,
    exponents: Vec<u32>,
}

pub fn quadratic_sieve(n: &BigInt) -> Option<BigInt> {
    let bits = n.bits();
    let bound = if bits < 30 {
        100
    } else if bits < 60 {
        1000
    } else {
        5000
    };
    let factor_base = build_factor_base(n, bound);
    let m = (bound as i64 * 30).clamp(5000, 100000);

    let sqrt_n = n.sqrt();
    let mut sieve_array = vec![0.0f64; (2 * m + 1) as usize];
    for i in 0..sieve_array.len() {
        let z = i as i64 - m;
        let x = &sqrt_n + BigInt::from(z);
        let val = (&x * &x - n).abs();
        sieve_array[i] = (val.bits() as f64).max(1.0);
    }

    perform_sieving(&mut sieve_array, &factor_base, n, &sqrt_n, m);
    let relations = collect_smooth_relations(
        &sieve_array,
        &factor_base,
        n,
        &sqrt_n,
        m,
        factor_base.len() + 10,
    );

    if relations.len() <= factor_base.len() {
        return None;
    }

    let combos = solve_linear_algebra(&relations, factor_base.len());
    for combo in combos {
        if let Some(f) = find_factor(n, &combo, &relations, &factor_base) {
            return Some(f);
        }
    }
    None
}

fn build_factor_base(n: &BigInt, bound: u64) -> Vec<u64> {
    let mut base = vec![2u64];
    for p in 3..=bound {
        if is_prime(p) && is_quadratic_residue(n, p) {
            base.push(p);
        }
    }
    base
}

fn is_quadratic_residue(n: &BigInt, p: u64) -> bool {
    if p == 2 {
        return true;
    }
    let res = n.modpow(&BigInt::from((p - 1) / 2), &BigInt::from(p));
    res.is_one()
}

fn perform_sieving(sieve: &mut [f64], base: &[u64], n: &BigInt, sqrt_n: &BigInt, m: i64) {
    for &p in base {
        let p_bi = BigInt::from(p);
        let log_p = (p as f64).log2();
        if let Some((s1, s2)) = solve_square_roots(n, p) {
            for s in [s1, s2] {
                let rem = (&s - (sqrt_n % &p_bi) + &p_bi) % &p_bi;
                let mut z = -m + (rem.to_i64().unwrap() - (-m % p as i64) + p as i64) % p as i64;
                while z <= m {
                    let idx = (z + m) as usize;
                    if idx < sieve.len() {
                        sieve[idx] -= log_p;
                    }
                    z += p as i64;
                }
            }
        }
    }
}

fn solve_square_roots(n: &BigInt, p: u64) -> Option<(BigInt, BigInt)> {
    if p == 2 {
        return Some((BigInt::one(), BigInt::one()));
    }
    let n_mod = (n % p).to_u64().unwrap();
    if n_mod == 0 {
        return Some((BigInt::zero(), BigInt::zero()));
    }

    // Tonelli-Shanks
    let mut q = p - 1;
    let mut s = 0u32;
    while q % 2 == 0 {
        q /= 2;
        s += 1;
    }

    let mut z = 2;
    while BigInt::from(z).modpow(&BigInt::from((p - 1) / 2), &BigInt::from(p))
        != BigInt::from(p - 1)
    {
        z += 1;
    }

    let mut m = s;
    let mut c = BigInt::from(z).modpow(&BigInt::from(q), &BigInt::from(p));
    let mut t = BigInt::from(n_mod).modpow(&BigInt::from(q), &BigInt::from(p));
    let mut r = BigInt::from(n_mod).modpow(&BigInt::from((q + 1) / 2), &BigInt::from(p));

    while !t.is_one() {
        let mut i = 1;
        let mut temp = (&t * &t) % p;
        while !temp.is_one() {
            temp = (&temp * &temp) % p;
            i += 1;
            if i == m {
                return None;
            }
        }
        let b = c.modpow(&BigInt::from(1u64 << (m - i - 1)), &BigInt::from(p));
        m = i;
        c = (&b * &b) % p;
        t = (&t * &c) % p;
        r = (&r * &b) % p;
    }
    Some((r.clone(), BigInt::from(p) - r))
}

fn collect_smooth_relations(
    sieve: &[f64],
    base: &[u64],
    n: &BigInt,
    sqrt_n: &BigInt,
    m: i64,
    desired: usize,
) -> Vec<Relation> {
    let mut rels = Vec::new();
    let mut threshold = 2.0; // Heuristic
    for (i, &val) in sieve.iter().enumerate() {
        if val < threshold {
            let z = i as i64 - m;
            let x = sqrt_n + BigInt::from(z);
            let mut y = (&x * &x - n).abs();
            let mut exps = vec![0u32; base.len()];
            for (j, &p) in base.iter().enumerate() {
                let p_bi = BigInt::from(p);
                while (&y % &p_bi).is_zero() {
                    y /= &p_bi;
                    exps[j] += 1;
                }
            }
            if y.is_one() {
                rels.push(Relation { x, exponents: exps });
                if rels.len() >= desired {
                    break;
                }
            }
        }
    }
    rels
}

fn solve_linear_algebra(rels: &[Relation], num_primes: usize) -> Vec<Vec<usize>> {
    let rows = num_primes;
    let cols = rels.len();
    let mut data = Vec::with_capacity(rows * cols);
    for r in 0..rows {
        for rel in rels {
            data.push(GF2::new((rel.exponents[r] & 1) as i64));
        }
    }
    let mat = Matrix::new(rows, cols, data).unwrap();
    let rref = mat.rref().unwrap();
    let basis = rref.find_kernel_basis_from_rref().unwrap();

    basis
        .into_iter()
        .map(|v| {
            v.iter()
                .enumerate()
                .filter(|(_, x)| !x.is_zero())
                .map(|(idx, _)| idx)
                .collect()
        })
        .collect()
}

fn find_factor(n: &BigInt, combo: &[usize], rels: &[Relation], base: &[u64]) -> Option<BigInt> {
    let mut x_prod = BigInt::one();
    let mut e_sum = vec![0u32; base.len()];
    for &idx in combo {
        x_prod = (x_prod * &rels[idx].x) % n;
        for (j, &e) in rels[idx].exponents.iter().enumerate() {
            e_sum[j] += e;
        }
    }
    let mut y_prod = BigInt::one();
    for (j, &e) in e_sum.iter().enumerate() {
        let p = BigInt::from(base[j]);
        y_prod = (y_prod * p.modpow(&BigInt::from(e / 2), n)) % n;
    }
    let g = (x_prod - y_prod).abs().gcd(n);
    if g > BigInt::one() && &g < n {
        Some(g)
    } else {
        None
    }
}
