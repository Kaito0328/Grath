// 任意のクレート/機能で共通利用できるよう、kind は自由な文字列にしています。
// 例: "algebraic.symbolicComplex", "coding.gf2.matrix", ...
export type VariableKind = string;

export interface VariableEntry {
  id: string;
  kind: VariableKind;
  name: string;
  value: string;
  latex?: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
}
