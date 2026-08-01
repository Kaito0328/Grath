/// Best-effort LaTeX -> infix text conversion.
///
/// This is intentionally minimal: we only support the subset needed by the UI
/// input mode (fractions, sqrt, implicit multiplication, basic operators).
///
/// The returned string is meant to be parsed by existing `FromStr` parsers.
pub fn latex_to_infix(input: &str) -> String {
    let mut s = input.trim().to_string();

    // Strip math mode delimiters.
    if s.starts_with("$$") && s.ends_with("$$") && s.len() >= 4 {
        s = s[2..s.len() - 2].to_string();
    } else if s.starts_with('$') && s.ends_with('$') && s.len() >= 2 {
        s = s[1..s.len() - 1].to_string();
    }

    // Remove sizing wrappers.
    s = s.replace("\\left", "").replace("\\right", "");

    // Normalize a few common commands.
    s = s
        .replace("\\cdot", "*")
        .replace("\\times", "*")
        .replace("\\div", "/")
        .replace("\\pi", "pi")
        .replace("\\,", "")
        .replace("\\!", "");

    // Expand structured commands first (so braces still exist).
    s = replace_frac_and_sqrt(&s);

    // Convert remaining braces to parentheses.
    s = s.replace('{', "(").replace('}', ")");

    let tokens = tokenize(&s);
    let tokens = insert_implicit_mul(tokens);
    tokens.join(" ")
}

fn replace_frac_and_sqrt(s: &str) -> String {
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0usize;
    let mut out = String::new();

    while i < chars.len() {
        if starts_with(&chars, i, "\\frac") {
            i += "\\frac".len();
            skip_ws(&chars, &mut i);
            if i < chars.len() && chars[i] == '{' {
                if let Some((num, next_i)) = extract_braced(&chars, i) {
                    i = next_i;
                    skip_ws(&chars, &mut i);
                    if i < chars.len() && chars[i] == '{' {
                        if let Some((den, next_i2)) = extract_braced(&chars, i) {
                            i = next_i2;
                            out.push('(');
                            out.push_str(&replace_frac_and_sqrt(&num));
                            out.push_str(")/(");
                            out.push_str(&replace_frac_and_sqrt(&den));
                            out.push(')');
                            continue;
                        }
                    }
                }
            }
            // fallthrough: not a well-formed \frac
            out.push_str("\\frac");
            continue;
        }

        if starts_with(&chars, i, "\\sqrt") {
            i += "\\sqrt".len();
            skip_ws(&chars, &mut i);

            // Optional root index: \sqrt[n]{x}
            let mut root_n: Option<String> = None;
            if i < chars.len() && chars[i] == '[' {
                if let Some((idx, next_i)) = extract_bracketed(&chars, i) {
                    root_n = Some(idx);
                    i = next_i;
                    skip_ws(&chars, &mut i);
                }
            }

            if i < chars.len() && chars[i] == '{' {
                if let Some((inner, next_i)) = extract_braced(&chars, i) {
                    i = next_i;
                    let inner = replace_frac_and_sqrt(&inner);
                    match root_n.as_deref().map(|x| x.trim()) {
                        Some(n) if !n.is_empty() && n.chars().all(|c| c.is_ascii_digit()) => {
                            out.push('(');
                            out.push_str(&inner);
                            out.push_str(")^(1/");
                            out.push_str(n);
                            out.push(')');
                        }
                        _ => {
                            out.push('(');
                            out.push_str(&inner);
                            out.push_str(")^(1/2)");
                        }
                    }
                    continue;
                }
            }

            out.push_str("\\sqrt");
            continue;
        }

        out.push(chars[i]);
        i += 1;
    }

    out
}

fn starts_with(chars: &[char], i: usize, pat: &str) -> bool {
    let pat_chars: Vec<char> = pat.chars().collect();
    if i + pat_chars.len() > chars.len() {
        return false;
    }
    chars[i..i + pat_chars.len()] == pat_chars[..]
}

fn skip_ws(chars: &[char], i: &mut usize) {
    while *i < chars.len() && chars[*i].is_whitespace() {
        *i += 1;
    }
}

fn extract_braced(chars: &[char], start: usize) -> Option<(String, usize)> {
    if start >= chars.len() || chars[start] != '{' {
        return None;
    }
    let mut depth = 0i32;
    let mut i = start;
    let mut inner = String::new();
    while i < chars.len() {
        let c = chars[i];
        if c == '{' {
            depth += 1;
            if depth > 1 {
                inner.push(c);
            }
        } else if c == '}' {
            depth -= 1;
            if depth == 0 {
                return Some((inner, i + 1));
            }
            inner.push(c);
        } else {
            if depth >= 1 {
                inner.push(c);
            }
        }
        i += 1;
    }
    None
}

fn extract_bracketed(chars: &[char], start: usize) -> Option<(String, usize)> {
    if start >= chars.len() || chars[start] != '[' {
        return None;
    }
    let mut i = start + 1;
    let mut inner = String::new();
    while i < chars.len() {
        let c = chars[i];
        if c == ']' {
            return Some((inner, i + 1));
        }
        inner.push(c);
        i += 1;
    }
    None
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Tok {
    Num(String),
    Ident(String),
    Op(char),
    LParen,
    RParen,
}

fn tokenize(s: &str) -> Vec<Tok> {
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0usize;
    let mut out: Vec<Tok> = Vec::new();

    while i < chars.len() {
        let c = chars[i];
        if c.is_whitespace() {
            i += 1;
            continue;
        }

        if c.is_ascii_digit() {
            let mut j = i + 1;
            while j < chars.len() && chars[j].is_ascii_digit() {
                j += 1;
            }
            out.push(Tok::Num(chars[i..j].iter().collect()));
            i = j;
            continue;
        }

        if c.is_ascii_alphabetic() {
            let mut j = i + 1;
            while j < chars.len() && (chars[j].is_ascii_alphanumeric() || chars[j] == '_') {
                j += 1;
            }
            out.push(Tok::Ident(chars[i..j].iter().collect()));
            i = j;
            continue;
        }

        match c {
            '(' => {
                out.push(Tok::LParen);
                i += 1;
            }
            ')' => {
                out.push(Tok::RParen);
                i += 1;
            }
            '+' | '-' | '*' | '/' | '^' => {
                out.push(Tok::Op(c));
                i += 1;
            }
            _ => {
                // Drop unknown characters (including remaining backslashes).
                i += 1;
            }
        }
    }

    out
}

fn insert_implicit_mul(tokens: Vec<Tok>) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    let mut prev: Option<Tok> = None;

    for tok in tokens.into_iter() {
        if let Some(p) = &prev {
            if needs_mul(p, &tok) {
                out.push("*".to_string());
            }
        }
        out.push(tok_to_string(&tok));
        prev = Some(tok);
    }

    out
}

fn tok_to_string(tok: &Tok) -> String {
    match tok {
        Tok::Num(s) => s.clone(),
        Tok::Ident(s) => s.clone(),
        Tok::Op(c) => c.to_string(),
        Tok::LParen => "(".to_string(),
        Tok::RParen => ")".to_string(),
    }
}

fn is_term_end(tok: &Tok) -> bool {
    matches!(tok, Tok::Num(_) | Tok::Ident(_) | Tok::RParen)
}

fn is_term_start(tok: &Tok) -> bool {
    matches!(tok, Tok::Num(_) | Tok::Ident(_) | Tok::LParen)
}

fn needs_mul(prev: &Tok, next: &Tok) -> bool {
    if !is_term_end(prev) || !is_term_start(next) {
        return false;
    }

    // Avoid: "1 - 2" => "1 * - 2" (handled as operator).
    if matches!(next, Tok::Op('-')) {
        return false;
    }

    true
}
