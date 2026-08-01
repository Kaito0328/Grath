use crate::{NumberTheoryError, Result};
use std::collections::BTreeMap;

/// Returns the Greatest Common Divisor of a and b.
pub fn gcd(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        a %= b;
        std::mem::swap(&mut a, &mut b);
    }
    a
}

/// Returns the Least Common Multiple of a and b.
pub fn lcm(a: u64, b: u64) -> u64 {
    if a == 0 || b == 0 {
        return 0;
    }
    (a / gcd(a, b)) * b
}

/// Extended Euclidean Algorithm.
/// Returns (gcd, x, y) such that ax + by = gcd(a, b).
pub fn extended_gcd(a: i64, b: i64) -> (i64, i64, i64) {
    if a == 0 {
        return (b.abs(), 0, b.signum());
    }
    let (g, x1, y1) = extended_gcd(b % a, a);
    let x = y1 - (b / a) * x1;
    let y = x1;
    (g, x, y)
}

/// Computes (base^exp) % m.
pub fn mod_pow(mut base: u64, mut exp: u64, m: u64) -> u64 {
    if m == 1 {
        return 0;
    }
    let mut res = 1;
    base %= m;
    while exp > 0 {
        if exp % 2 == 1 {
            res = (res as u128 * base as u128 % m as u128) as u64;
        }
        base = (base as u128 * base as u128 % m as u128) as u64;
        exp /= 2;
    }
    res
}

/// Returns modular inverse of a modulo m.
pub fn mod_inverse(a: i64, m: i64) -> Result<i64> {
    let (g, x, _) = extended_gcd(a, m);
    if g != 1 {
        return Err(NumberTheoryError::InvalidArgument(format!(
            "{} has no modular inverse modulo {}",
            a, m
        )));
    }
    Ok((x % m + m) % m)
}

/// Naive primality test.
pub fn is_prime_naive(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 || n == 3 {
        return true;
    }
    if n % 2 == 0 || n % 3 == 0 {
        return false;
    }
    let mut i = 5;
    while i * i <= n {
        if n % i == 0 || n % (i + 2) == 0 {
            return false;
        }
        i += 6;
    }
    true
}

/// Naive factorization.
pub fn factorize_naive(mut n: u64) -> BTreeMap<u64, u32> {
    let mut factors = BTreeMap::new();
    if n < 2 {
        return factors;
    }
    let mut d = 2;
    while d * d <= n {
        while n % d == 0 {
            *factors.entry(d).or_insert(0) += 1;
            n /= d;
        }
        d += 1;
    }
    if n > 1 {
        *factors.entry(n).or_insert(0) += 1;
    }
    factors
}

/// Euler's totient function.
pub fn phi(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    let mut result = n;
    let mut m = n;
    let mut d = 2;
    while d * d <= m {
        if m % d == 0 {
            while m % d == 0 {
                m /= d;
            }
            result -= result / d;
        }
        d += 1;
    }
    if m > 1 {
        result -= result / m;
    }
    result
}
