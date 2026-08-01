use crate::expr::SymbolicExpr;
use crate::rational::Rational;
use core::fmt;

impl SymbolicExpr {
    /// 数式をLaTeX形式の文字列に変換します。
    pub fn to_latex(&self) -> String {
        self.to_latex_inner(0) // 親の優先順位を最も低い0として開始
    }

    /// 演算子の優先順位を考慮した内部ヘルパー
    /// parent_precedence: 呼び出し元の演算子の優先順位
    fn to_latex_inner(&self, parent_precedence: u8) -> String {
        match self {
            SymbolicExpr::Rational(r) => r.to_latex(),
            SymbolicExpr::Symbol(s) => {
                // π などの特別な記号をLaTeXコマンドに変換
                match s.as_str() {
                    "pi" => "\\pi".to_string(),
                    "e" => "e".to_string(),
                    _ => s.clone(),
                }
            }
            SymbolicExpr::Add(terms) => {
                let precedence = 1;
                let mut result = String::new();
                for (i, term) in terms.iter().enumerate() {
                    // 符号の処理: "a + -b" を "a - b" にする
                    if i > 0 {
                        if let Some(s) = term.to_latex_inner(precedence).strip_prefix('-') {
                            result.push_str("-");
                            result.push_str(s);
                            continue;
                        }
                        result.push_str("+");
                    }
                    result.push_str(&term.to_latex_inner(precedence));
                }
                // 自分より優先順位の高い演算子の子である場合、括弧で囲む
                if precedence < parent_precedence {
                    format!("({})", result)
                } else {
                    result
                }
            }
            SymbolicExpr::Mul(factors) => {
                let precedence = 2;

                // Prefer unary minus over explicit (-1) coefficient.
                let mut negate = false;
                let mut kept: Vec<&SymbolicExpr> = Vec::with_capacity(factors.len());
                for f in factors.iter() {
                    match f {
                        SymbolicExpr::Rational(r) if r.is_minus_one() => {
                            negate = !negate;
                        }
                        _ => kept.push(f),
                    }
                }

                let mut s = if kept.is_empty() {
                    if negate {
                        "-1".to_string()
                    } else {
                        "1".to_string()
                    }
                } else {
                    let mut res = String::new();
                    let mut first = true;
                    let mut last_f: Option<&SymbolicExpr> = None;
                    for f in kept {
                        if !first {
                            if needs_explicit_mul(last_f.unwrap(), f) {
                                res.push_str("\\cdot ");
                            } else {
                                // No space for juxtaposition in LaTeX
                                res.push_str("");
                            }
                        }
                        res.push_str(&f.to_latex_inner(precedence));
                        first = false;
                        last_f = Some(f);
                    }
                    res
                };

                if negate && !factors.is_empty() {
                    // Check if factors[0] was actually the -1 we skipped.
                    // If the first kept factor needs a sign, we should be careful.
                    s = format!("-{}", s);
                }

                if precedence < parent_precedence {
                    format!("({})", s)
                } else {
                    s
                }
            }
            SymbolicExpr::Pow(base, exp) => {
                let precedence = 3;
                // 指数が 1/2 なら sqrt, 1/n なら n乗根の形にする
                if let SymbolicExpr::Rational(r) = &**exp {
                    if r.numer() == 1 && r.denom() == 2 {
                        return format!("\\sqrt{{{}}}", base.to_latex_inner(0));
                    }
                    if r.numer() == 1 && r.denom() > 2 {
                        return format!("\\sqrt[{}]{{{}}}", r.denom(), base.to_latex_inner(0));
                    }
                }

                let s = format!(
                    "{{{}}}^{{{}}}",
                    base.to_latex_inner(precedence),
                    exp.to_latex_inner(0)
                );

                if precedence < parent_precedence {
                    format!("({})", s)
                } else {
                    s
                }
            }
        }
    }
}

impl fmt::Display for SymbolicExpr {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SymbolicExpr::Rational(r) => write!(f, "{}", r),
            SymbolicExpr::Symbol(s) => write!(f, "{}", s),
            SymbolicExpr::Add(terms) => {
                let mut first = true;
                for t in terms {
                    match t {
                        SymbolicExpr::Rational(r) if !first && r.numer() < 0 => {
                            write!(f, " - {}", Rational::from_int(-r.numer()).simplified())?;
                        }
                        _ => {
                            if !first {
                                write!(f, " + ")?;
                            }
                            write!(f, "{}", t)?;
                        }
                    }
                    first = false;
                }
                Ok(())
            }
            SymbolicExpr::Mul(factors) => {
                let mut first = true;
                let mut last_fac: Option<&SymbolicExpr> = None;
                let mut start_index = 0;

                // Handle leading -1 for prettier output: -1 * a -> -a
                if factors.len() >= 2 {
                    if let SymbolicExpr::Rational(r) = &factors[0] {
                        if r.is_minus_one() {
                            write!(f, "-")?;
                            start_index = 1;
                        }
                    }
                }

                for i in start_index..factors.len() {
                    let fac = &factors[i];
                    if !first {
                        let prev = last_fac.unwrap();
                        if needs_explicit_mul(prev, fac) {
                            write!(f, "*")?;
                        }
                    }
                    // add parentheses for Add inside Mul
                    match fac {
                        SymbolicExpr::Add(_) => write!(f, "({})", fac)?,
                        _ => write!(f, "{}", fac)?,
                    }
                    first = false;
                    last_fac = Some(fac);
                }
                Ok(())
            }
            SymbolicExpr::Pow(b, e) => {
                let need_paren = matches!(**b, SymbolicExpr::Add(_) | SymbolicExpr::Mul(_));
                if need_paren {
                    write!(f, "({})^{{{}}}", b, e)
                } else {
                    write!(f, "{}^{{{}}}", b, e)
                }
            }
        }
    }
}

fn needs_explicit_mul(left: &SymbolicExpr, right: &SymbolicExpr) -> bool {
    match (left, right) {
        // k * n -> k*n
        (SymbolicExpr::Rational(_), SymbolicExpr::Rational(_)) => true,

        // a * 2 -> a*2
        (SymbolicExpr::Symbol(_), SymbolicExpr::Rational(_)) => true,

        // (a+b) * 2 -> (a+b)*2
        (SymbolicExpr::Add(_), SymbolicExpr::Rational(_)) => true,

        // Right side is Symbol (2a, ab, (x+y)z)
        (_, SymbolicExpr::Symbol(_)) => false,

        // Right side is parenthesized Add (2(a+b), a(b+c), (x+y)(z+w))
        (_, SymbolicExpr::Add(_)) => false,

        // Left side is parenthesized Add ((a+b)c, (a+b)2, (a+b)x^2)
        (SymbolicExpr::Add(_), _) => false,

        // Right side is Pow (2x^2, ax^2, (a+b)x^2)
        (_, SymbolicExpr::Pow(b, _)) => match &**b {
            SymbolicExpr::Symbol(_) => false,
            SymbolicExpr::Add(_) => false,
            _ => true,
        },

        _ => true,
    }
}
