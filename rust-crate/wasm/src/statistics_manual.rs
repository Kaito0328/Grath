use wasm_bindgen::prelude::*;
use js_sys::Float64Array;
use statistics::hypothesis::Tail;
use statistics::distribution::continuous::core::Distribution as ContinuousDistribution;
use statistics::distribution::discrete::core::Distribution as DiscreteDistribution;
use statistics::modeling::RegressionResult;

fn js_error_from_display<E: std::fmt::Display>(e: E) -> JsError {
    JsError::new(&e.to_string())
}

#[wasm_bindgen]
pub fn run_one_sample_t_test(data: Float64Array, mu0: f64, tail: String, alpha: f64) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let xs = data.to_vec();
    statistics::hypothesis::one_sample_t(&xs, mu0, tail_enum, Some(alpha))
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_two_sample_t_test(x: Float64Array, y: Float64Array, pooled: bool, tail: String, alpha: f64) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let xv = x.to_vec();
    let yv = y.to_vec();
    let res = if pooled {
        statistics::hypothesis::two_sample_t_pooled(&xv, &yv, tail_enum, Some(alpha))
    } else {
        statistics::hypothesis::two_sample_t_welch(&xv, &yv, tail_enum, Some(alpha))
    };
    res
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_one_way_anova(groups: JsValue, tail: String) -> std::result::Result<WasmTestResult, JsError> {
    let groups_vec: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(groups)?;
    let groups_refs: Vec<&[f64]> = groups_vec.iter().map(|v| v.as_slice()).collect();
    
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    
    statistics::hypothesis::one_way_anova(&groups_refs, tail_enum)
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_f_test(x: Float64Array, y: Float64Array, tail: String, alpha: f64) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let xv = x.to_vec();
    let yv = y.to_vec();
    statistics::hypothesis::f_test_variance_ratio(&xv, &yv, tail_enum, Some(alpha))
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_z_test_proportion(successes: u64, n: u64, p0: f64, tail: String, alpha: f64) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    statistics::hypothesis::z_test_proportion(successes, n, p0, tail_enum, Some(alpha))
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_z_test_two_proportions(x1: u64, n1: u64, x2: u64, n2: u64, tail: String, alpha: f64) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    statistics::hypothesis::z_test_two_proportions(x1, n1, x2, n2, tail_enum, Some(alpha))
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_mann_whitney_u(x: Float64Array, y: Float64Array, tail: String, continuity: bool) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let xv = x.to_vec();
    let yv = y.to_vec();
    statistics::hypothesis::mann_whitney_u(&xv, &yv, tail_enum, continuity)
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_wilcoxon_signed_rank(x: Float64Array, y: Float64Array, tail: String, continuity: bool) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let xv = x.to_vec();
    let yv = y.to_vec();
    statistics::hypothesis::wilcoxon_signed_rank(&xv, &yv, tail_enum, continuity)
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_kruskal_wallis(groups: JsValue, tail: String) -> std::result::Result<WasmTestResult, JsError> {
    let groups_vec: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(groups)?;
    let groups_refs: Vec<&[f64]> = groups_vec.iter().map(|v| v.as_slice()).collect();
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    statistics::hypothesis::kruskal_wallis(&groups_refs, tail_enum)
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_pearson_correlation(x: Float64Array, y: Float64Array, tail: String, alpha: f64) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let xv = x.to_vec();
    let yv = y.to_vec();
    statistics::hypothesis::correlation_t_test(&xv, &yv, tail_enum, Some(alpha))
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_chisq_gof(obs: Float64Array, exp: Float64Array, tail: String) -> std::result::Result<WasmTestResult, JsError> {
    let tail_enum = match tail.to_lowercase().as_str() {
        "less" => Tail::Less,
        "greater" => Tail::Greater,
        _ => Tail::TwoSided,
    };
    let ov = obs.to_vec();
    let ev = exp.to_vec();
    statistics::hypothesis::chisq_gof(&ov, &ev, tail_enum)
        .map(WasmTestResult)
        .map_err(js_error_from_display)
}

#[wasm_bindgen]
pub fn run_simple_linear_regression(x: Float64Array, y: Float64Array) -> std::result::Result<WasmRegressionResult, JsError> {
    let x_vec = x.to_vec();
    let y_vec = y.to_vec();
    
    let res = statistics::modeling::simple_linear_regression(&x_vec, &y_vec)
        .map_err(|e| JsError::new(&e.to_string()))?;
        
    Ok(WasmRegressionResult(res))
}

#[wasm_bindgen]
pub fn sample_normal(mean: f64, std: f64, n: usize) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let mut dist = statistics::Normal::new(mean, std).unwrap();
    (0..n)
        .map(|_| ContinuousDistribution::sample(&mut dist, &mut rng))
        .collect()
}

#[wasm_bindgen]
pub fn sample_t(df: f64, n: usize) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let mut dist = statistics::T::new(df as usize).unwrap();
    (0..n)
        .map(|_| ContinuousDistribution::sample(&mut dist, &mut rng))
        .collect()
}

#[wasm_bindgen]
pub fn sample_chisq(df: f64, n: usize) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let mut dist = statistics::ChiSquare::new(df as usize).unwrap();
    (0..n)
        .map(|_| ContinuousDistribution::sample(&mut dist, &mut rng))
        .collect()
}

#[wasm_bindgen]
pub fn sample_f(df1: f64, df2: f64, n: usize) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let mut dist = statistics::F::new(df1 as usize, df2 as usize).unwrap();
    (0..n)
        .map(|_| ContinuousDistribution::sample(&mut dist, &mut rng))
        .collect()
}

#[wasm_bindgen]
pub fn sample_binomial(n_trials: u64, p: f64, n_samples: usize) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let dist = statistics::Binomial::new(n_trials, p).unwrap();
    (0..n_samples).map(|_| DiscreteDistribution::sample(&dist, &mut rng) as f64).collect()
}

#[wasm_bindgen]
pub fn sample_poisson(lambda: f64, n: usize) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let dist = statistics::Poisson::new(lambda).unwrap();
    (0..n).map(|_| DiscreteDistribution::sample(&dist, &mut rng) as f64).collect()
}

#[wasm_bindgen]
pub fn get_normal_pdf_svg(mean: f64, std: f64, width: u32, height: u32) -> String {
    let dist = statistics::Normal::new(mean, std).unwrap();
    let opts = statistics::plot::SvgOptions {
        x_range: Some((-4.0 * std + mean, 4.0 * std + mean)),
        ..Default::default()
    };
    statistics::plot::svg_continuous_pdf_with(&dist, width, height, &opts)
}

#[wasm_bindgen]
pub fn get_t_pdf_svg(df: f64, width: u32, height: u32) -> String {
    let dist = statistics::T::new(df as usize).unwrap();
    let opts = statistics::plot::SvgOptions {
        x_range: Some((-4.0, 4.0)),
        ..Default::default()
    };
    statistics::plot::svg_continuous_pdf_with(&dist, width, height, &opts)
}

#[wasm_bindgen]
pub fn get_binomial_pmf_svg(n: u64, p: f64, width: u32, height: u32) -> String {
    let dist = statistics::Binomial::new(n, p).unwrap();
    statistics::plot::svg_discrete_pmf(&dist, width, height)
}

#[wasm_bindgen]
pub fn get_poisson_pmf_svg(lambda: f64, width: u32, height: u32) -> String {
    let dist = statistics::Poisson::new(lambda).unwrap();
    statistics::plot::svg_discrete_pmf(&dist, width, height)
}

#[wasm_bindgen]
pub fn get_chisq_pdf_svg(df: f64, width: u32, height: u32) -> String {
    let dist = statistics::ChiSquare::new(df as usize).unwrap();
    let opts = statistics::plot::SvgOptions {
        x_range: Some((0.0, df + 4.0 * df.sqrt())),
        ..Default::default()
    };
    statistics::plot::svg_continuous_pdf_with(&dist, width, height, &opts)
}

#[wasm_bindgen]
pub fn get_f_pdf_svg(df1: f64, df2: f64, width: u32, height: u32) -> String {
    let dist = statistics::F::new(df1 as usize, df2 as usize).unwrap();
    let opts = statistics::plot::SvgOptions {
        x_range: Some((0.0, 5.0)),
        ..Default::default()
    };
    statistics::plot::svg_continuous_pdf_with(&dist, width, height, &opts)
}

#[wasm_bindgen]
pub fn add_gaussian_noise(data: Float64Array, std_dev: f64) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let mut out = data.to_vec();
    let dist = rand_distr::Normal::new(0.0, std_dev).unwrap();
    use rand::prelude::*;
    for x in out.iter_mut() {
        *x += dist.sample(&mut rng);
    }
    out
}

#[wasm_bindgen]
pub fn add_outliers(data: Float64Array, count: usize, min: f64, max: f64) -> Vec<f64> {
    let mut rng = rand::thread_rng();
    let mut out = data.to_vec();
    use rand::prelude::*;
    for _ in 0..count {
        if out.is_empty() { break; }
        let idx = rng.gen_range(0..out.len());
        out[idx] = rng.gen_range(min..max);
    }
    out
}

#[wasm_bindgen]
pub struct WasmTestResult(pub(crate) statistics::hypothesis::TestResult);

#[wasm_bindgen]
impl WasmTestResult {
    #[wasm_bindgen(getter)]
    pub fn statistic(&self) -> f64 { self.0.stat }
    #[wasm_bindgen(getter)]
    pub fn p_value(&self) -> f64 { self.0.p_value }
    #[wasm_bindgen(getter)]
    pub fn df(&self) -> f64 { self.0.df1.unwrap_or(0.0) }
    #[wasm_bindgen(getter)]
    pub fn is_rejected(&self) -> bool { self.0.p_value < 0.05 }
}

#[wasm_bindgen]
pub struct WasmRegressionResult(pub(crate) RegressionResult);

#[wasm_bindgen]
impl WasmRegressionResult {
    #[wasm_bindgen(getter)]
    pub fn slope(&self) -> f64 { self.0.coefficients.get(1).copied().unwrap_or(0.0) }
    #[wasm_bindgen(getter)]
    pub fn intercept(&self) -> f64 { self.0.coefficients.get(0).copied().unwrap_or(0.0) }
    #[wasm_bindgen(getter)]
    pub fn r_squared(&self) -> f64 { self.0.r_squared }
    #[wasm_bindgen(getter)]
    pub fn p_value(&self) -> f64 { f64::NAN }
    #[wasm_bindgen(getter)]
    pub fn std_err(&self) -> f64 { f64::NAN }

    #[wasm_bindgen(getter)]
    pub fn coefficients(&self) -> Vec<f64> { self.0.coefficients.clone() }

    #[wasm_bindgen(getter)]
    pub fn residuals(&self) -> Vec<f64> { self.0.residuals.clone() }
}
