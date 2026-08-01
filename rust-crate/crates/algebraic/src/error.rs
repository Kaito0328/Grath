use crate::expr::parser::Token;
use strum_macros::AsRefStr;
use thiserror::Error;

/// 構文解析中に発生する可能性のあるエラーを定義します。
// Error (thiserror用) と AsRefStr (エラーコード用) を追加
#[derive(Debug, Clone, PartialEq, Error, AsRefStr)]
pub enum AlgebraicError {
    /// 予期しない文字が見つかった場合
    // format!構文と同じように書けます。{0} は 0番目の引数(char)を指します
    #[error("Unexpected character: '{0}'")]
    UnexpectedCharacter(char),

    /// 数値のフォーマットが不正な場合
    #[error("Invalid number format: {0}")]
    InvalidNumber(String),

    /// 予期しないトークンが見つかった場合
    // 名前付きフィールドもそのまま参照できます
    // found:? とすることで Token の Debug実装 ({:?}) を呼び出します
    #[error("Unexpected token: expected {expected}, found {found:?}")]
    UnexpectedToken { expected: String, found: Token },

    /// 入力が予期せず終了した場合
    #[error("Unexpected end of input")]
    UnexpectedEof,

    /// 未知の関数または変数が使用された場合
    #[error("Unknown function or variable: '{0}'")]
    UnknownFunction(String),

    #[error("Division by zero")]
    DivisionByZero,

    /// 有理数の演算結果が表現可能な範囲(u64)を超えた場合
    #[error("Rational number overflow: {0}")]
    RationalOverflow(String),

    #[error("Parse error: {0}")]
    ParseError(String),
}

pub type Result<T> = std::result::Result<T, AlgebraicError>;
