# ベースはNode.js (LTS)
FROM node:20-bullseye

# 必要な基本ツールのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    build-essential \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Rustのインストール (rustupを使用)
# -y: 確認なしでインストール
# --default-toolchain stable: 安定版を使用
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable \
    && /usr/local/cargo/bin/rustup component add rust-src rustfmt clippy \
    && /usr/local/cargo/bin/rustup target add wasm32-unknown-unknown

# wasm-packのインストール (Wasmビルドに必須)
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 作業ユーザー(node)への権限付与
RUN chown -R node:node /usr/local/cargo /usr/local/rustup

# ユーザーを切り替え
USER node