# ベースはNode.js (LTS)
FROM node:20-bullseye

# 基本ツールと GitHub CLI（公式 apt repository）
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        build-essential \
        ca-certificates \
    && install -d -m 0755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && chmod a+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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
