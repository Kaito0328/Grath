/// 二項係数 C(n, k) を 64bit 浮動小数点で返す。
/// n, k は非負整数。k > n の場合は 0。
pub fn binom(n: usize, k: usize) -> f64 {
    if k > n {
        return 0.0;
    }
    if k == 0 || k == n {
        return 1.0;
    }
    let k = k.min(n - k);
    let mut num = 1.0f64;
    let mut den = 1.0f64;
    for i in 1..=k {
        num *= (n - (k - i)) as f64;
        den *= i as f64;
    }
    num / den
}

/// 第2種スターリング数 S(n, k) を動的計画法で計算。
pub fn stirling2(n: usize, k: usize) -> f64 {
    if k > n {
        return 0.0;
    }
    if n == 0 && k == 0 {
        return 1.0;
    }
    if n == 0 || k == 0 {
        return 0.0;
    }
    let mut dp = vec![vec![0.0f64; k + 1]; n + 1];
    dp[0][0] = 1.0;
    for i in 1..=n {
        for j in 1..=k {
            dp[i][j] = j as f64 * dp[i - 1][j] + dp[i - 1][j - 1];
        }
    }
    dp[n][k]
}

/// 第1種スターリング数 S1(n, k) を動的計画法で計算。
/// 再帰式: [n, k] = (n-1)[n-1, k] + [n-1, k-1]
pub fn stirling1(n: usize, k: usize) -> f64 {
    if k > n {
        return 0.0;
    }
    if n == 0 && k == 0 {
        return 1.0;
    }
    if n == 0 || k == 0 {
        return 0.0;
    }
    let mut dp = vec![vec![0.0f64; k + 1]; n + 1];
    dp[0][0] = 1.0;
    for i in 1..=n {
        for j in 1..=k {
            dp[i][j] = (i - 1) as f64 * dp[i - 1][j] + dp[i - 1][j - 1];
        }
    }
    dp[n][k]
}

/// ベルヌーイ数 B_n を再帰的に計算。
/// B_1 = -1/2 の定義を使用。
pub fn bernoulli(n: usize) -> f64 {
    if n == 0 {
        return 1.0;
    }
    let mut b = vec![0.0f64; n + 1];
    b[0] = 1.0;
    for i in 1..=n {
        let mut sum = 0.0f64;
        for k in 0..i {
            sum += binom(i + 1, k) * b[k];
        }
        b[i] = -sum / (i + 1) as f64;
    }
    b[n]
}

/// 調和数 H_n を計算。
pub fn harmonic(n: usize) -> f64 {
    let mut sum = 0.0f64;
    for i in 1..=n {
        sum += 1.0 / i as f64;
    }
    sum
}
