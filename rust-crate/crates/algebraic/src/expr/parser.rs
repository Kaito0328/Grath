use std::str::FromStr;

use crate::error::{AlgebraicError, Result};
use crate::{expr::SymbolicExpr, rational::Rational};

/// 字句解析器 (Lexer)

#[derive(Debug, PartialEq, Clone)]
pub enum Token {
    Number(Rational),
    Plus,
    Minus,
    Star,
    Slash,
    Caret, // ^
    LParen,
    RParen,
    Identifier(String),
    Eof,
}

pub(crate) struct Lexer<'a> {
    input: std::iter::Peekable<std::str::Chars<'a>>,
}

impl<'a> Lexer<'a> {
    fn new(input: &'a str) -> Self {
        Lexer {
            input: input.chars().peekable(),
        }
    }

    fn next_token(&mut self) -> Result<Token> {
        self.skip_whitespace();
        match self.input.peek().cloned() {
            Some('+') => {
                self.input.next();
                Ok(Token::Plus)
            }
            Some('-') => {
                self.input.next();
                Ok(Token::Minus)
            }
            Some('*') => {
                self.input.next();
                Ok(Token::Star)
            }
            Some('/') => {
                self.input.next();
                Ok(Token::Slash)
            }
            Some('^') => {
                self.input.next();
                Ok(Token::Caret)
            }
            Some('(') => {
                self.input.next();
                Ok(Token::LParen)
            }
            Some(')') => {
                self.input.next();
                Ok(Token::RParen)
            }
            Some(c) if c.is_ascii_digit() => self.parse_number(),
            Some(c) if c.is_alphabetic() => self.parse_identifier(),
            Some(c) => Err(AlgebraicError::UnexpectedCharacter(c)),
            None => Ok(Token::Eof),
        }
    }

    fn parse_number(&mut self) -> Result<Token> {
        let mut numer_str = String::new();
        while let Some(&c) = self.input.peek() {
            if c.is_ascii_digit() {
                numer_str.push(self.input.next().unwrap());
            } else {
                break;
            }
        }
        let numer = numer_str
            .parse::<i64>()
            .map_err(|_| AlgebraicError::InvalidNumber(numer_str.clone()))?;

        Ok(Token::Number(Rational::new(numer, 1)))
    }

    fn parse_identifier(&mut self) -> Result<Token> {
        let mut ident = String::new();
        while let Some(&c) = self.input.peek() {
            if c.is_alphanumeric() {
                ident.push(self.input.next().unwrap());
            } else {
                break;
            }
        }
        Ok(Token::Identifier(ident))
    }

    fn all_tokens(mut self) -> Result<Vec<Token>> {
        let mut tokens = Vec::new();
        loop {
            let token = self.next_token()?;
            if token == Token::Eof {
                tokens.push(Token::Eof);
                break;
            }
            tokens.push(token);
        }
        Ok(tokens)
    }

    fn skip_whitespace(&mut self) {
        while let Some(&c) = self.input.peek() {
            if c.is_whitespace() {
                self.input.next();
            } else {
                break;
            }
        }
    }
}

/// 構文解析器 (Parser)
pub(crate) struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    pub fn new(input: &str) -> Result<Self> {
        let tokens = Lexer::new(input).all_tokens()?;
        let tokens = insert_implicit_mul(tokens);
        Ok(Parser { tokens, pos: 0 })
    }

    pub fn parse(&mut self) -> Result<SymbolicExpr> {
        let expr = self.parse_expression(0)?;
        let symplified = expr.simplify();
        // パース後に余分なトークンが残っていないかチェック
        match self.current()? {
            Token::Eof => Ok(symplified),
            token => Err(AlgebraicError::UnexpectedToken {
                expected: "end of input".to_string(),
                found: token.clone(),
            }),
        }
    }

    fn parse_expression(&mut self, binding_power: u8) -> Result<SymbolicExpr> {
        let mut lhs = match self.consume()? {
            Token::Number(r) => Ok(SymbolicExpr::Rational(r)),
            Token::LParen => {
                let expr = self.parse_expression(0)?;
                self.expect(Token::RParen)?;
                Ok(expr)
            }
            Token::Minus => {
                let rhs = self.parse_expression(50)?; // 前置演算子の優先度
                Ok(SymbolicExpr::Mul(vec![SymbolicExpr::int(-1), rhs]))
            }
            Token::Identifier(name) => self.parse_identifier_or_function(name),
            other => Err(AlgebraicError::UnexpectedToken {
                expected: "number, prefix operator, or parenthesis".to_string(),
                found: other,
            }),
        }?;

        loop {
            let op = self.current()?.clone();

            let (left_bp, right_bp) = match self.infix_binding_power(&op) {
                Some(bp) => bp,
                None => break,
            };

            if left_bp < binding_power {
                break;
            }

            self.advance();
            let rhs = self.parse_expression(right_bp)?;

            lhs = match op {
                Token::Plus => SymbolicExpr::add(vec![lhs, rhs]),
                Token::Minus => SymbolicExpr::add(vec![
                    lhs,
                    SymbolicExpr::Mul(vec![SymbolicExpr::int(-1), rhs]),
                ]),
                Token::Star => SymbolicExpr::mul(vec![lhs, rhs]),
                Token::Slash => SymbolicExpr::mul(vec![
                    lhs,
                    SymbolicExpr::Pow(Box::new(rhs), Box::new(SymbolicExpr::int(-1))),
                ]),
                Token::Caret => SymbolicExpr::pow(lhs, rhs),
                _ => unreachable!(), // `infix_binding_power`でフィルタされているはず
            };
        }

        Ok(lhs)
    }

    fn parse_identifier_or_function(&mut self, name: String) -> Result<SymbolicExpr> {
        if self.current()? != &Token::LParen {
            return Ok(SymbolicExpr::Symbol(name));
        }

        self.expect(Token::LParen)?; // '('を消費
        let arg = self.parse_expression(0)?;
        self.expect(Token::RParen)?; // ')'を消費

        match name.as_str() {
            "sqrt" => Ok(SymbolicExpr::pow(arg, SymbolicExpr::rational(1, 2))),
            "cbrt" => Ok(SymbolicExpr::pow(arg, SymbolicExpr::rational(1, 3))),
            _ => Err(AlgebraicError::UnknownFunction(name)),
        }
    }

    fn infix_binding_power(&self, token: &Token) -> Option<(u8, u8)> {
        match token {
            Token::Plus | Token::Minus => Some((10, 11)),
            Token::Star | Token::Slash => Some((20, 21)),
            Token::Caret => Some((32, 31)),
            _ => None,
        }
    }

    // -- パーサーのヘルパー関数 --
    fn current(&self) -> Result<&Token> {
        self.tokens
            .get(self.pos)
            .ok_or(AlgebraicError::UnexpectedEof)
    }

    fn advance(&mut self) {
        if self.pos < self.tokens.len() {
            self.pos += 1;
        }
    }

    fn consume(&mut self) -> Result<Token> {
        let token = self.current()?.clone();
        self.advance();
        Ok(token)
    }

    fn expect(&mut self, expected: Token) -> Result<()> {
        let found = self.consume()?;
        if found == expected {
            Ok(())
        } else {
            Err(AlgebraicError::UnexpectedToken {
                expected: format!("{:?}", expected),
                found,
            })
        }
    }
}

fn insert_implicit_mul(tokens: Vec<Token>) -> Vec<Token> {
    let mut out: Vec<Token> = Vec::with_capacity(tokens.len());
    let mut i = 0usize;
    while i < tokens.len() {
        let cur = tokens[i].clone();
        out.push(cur.clone());

        let next = tokens.get(i + 1);
        if let Some(next) = next {
            if needs_implicit_mul(&cur, next) {
                out.push(Token::Star);
            }
        }
        i += 1;
    }
    out
}

fn is_factor_end(tok: &Token) -> bool {
    matches!(tok, Token::Number(_) | Token::RParen)
}

fn is_factor_start(tok: &Token) -> bool {
    matches!(tok, Token::Number(_) | Token::Identifier(_) | Token::LParen)
}

fn needs_implicit_mul(cur: &Token, next: &Token) -> bool {
    // Insert '*' only for safe cases to avoid changing function-call semantics:
    // - 2i, 2x, 2( ... ), ( ... )2, ( ... )i
    // We intentionally do NOT insert between Identifier and LParen (e.g. x(y)),
    // because that would change the current "function call" error behavior.
    if !is_factor_end(cur) {
        return false;
    }
    if !is_factor_start(next) {
        return false;
    }
    // Avoid: "2 - 3" becoming "2 * - 3" (next is Minus token, not factor start)
    true
}

impl FromStr for Parser {
    type Err = AlgebraicError;

    fn from_str(s: &str) -> Result<Self> {
        let parser = Parser::new(s)?;
        Ok(parser)
    }
}

impl std::fmt::Display for Parser {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Parser with {} tokens", self.tokens.len())
    }
}

// --- 使用例とテスト ---
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_precedence_and_parentheses() {
        let input = "1 + 2 * (30 - 4)^2";
        let ast = Parser::new(input).unwrap().parse().unwrap();
        // 期待されるASTの形を文字列表現などで確認するのが良い
        println!("AST for '{}':\n{:?}\n", input, ast);
        assert!(!format!("{:?}", ast).is_empty());
    }

    #[test]
    fn test_sqrt_function() {
        let input = "sqrt(16) + cbrt(8)";
        let ast = Parser::new(input).unwrap().parse().unwrap();
        println!("AST for '{}':\n{:?}\n", input, ast);
        assert!(!format!("{:?}", ast).is_empty());
    }

    #[test]
    fn test_invalid_input_unexpected_token() {
        let input = "1 + * 2";
        let result = Parser::new(input).unwrap().parse();
        assert!(result.is_err());
        println!("Error for '{}':\n{:?}\n", input, result.unwrap_err());
    }

    #[test]
    fn test_unknown_function_as_error() {
        let input = "foo(1) + x";
        // Lexerは成功するがParserでエラーになる
        let result = Parser::new(input).unwrap().parse();
        assert!(result.is_err());
        println!("Error for '{}':\n{:?}\n", input, result.unwrap_err());
    }

    #[test]
    fn test_mismatched_parentheses() {
        let input = "(1 + 2";
        let result = Parser::new(input).unwrap().parse();
        assert!(result.is_err());
        println!("Error for '{}':\n{:?}\n", input, result.unwrap_err());
    }

    #[test]
    fn test_implicit_mul_number_ident() {
        let input = "2i";
        let expr = Parser::new(input).unwrap().parse().unwrap();
        assert_eq!(expr.to_string(), "2i");
    }

    #[test]
    fn test_implicit_mul_number_paren() {
        let input = "2(1+2)";
        let expr = Parser::new(input).unwrap().parse().unwrap();
        assert_eq!(expr.to_string(), "6");
    }

    #[test]
    fn test_implicit_mul_rparen_ident() {
        let input = "(1+1)i";
        let expr = Parser::new(input).unwrap().parse().unwrap();
        assert_eq!(expr.to_string(), "2i");
    }
}
