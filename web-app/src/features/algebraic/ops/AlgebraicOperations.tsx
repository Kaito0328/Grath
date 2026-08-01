"use client";
import { Stack } from "../../../design/primitives/Stack";

import { useState } from "react";
import { Select } from "../../../design/baseComponents/Select";
import { Text } from "../../../design/baseComponents/Text";
import { SimplifyOperation } from "./simplify/SimplifyOperation";
import { ExprBinaryOperation } from "./expr-binary/ExprBinaryOperation";
import { RationalSimplifyOperation } from "./rational/RationalSimplifyOperation";
import { RationalBinaryOperation } from "./rational/RationalBinaryOperation";
import { ComplexBinaryOperation } from "./complex-binary/ComplexBinaryOperation";
type AlgebraicOperationKey =
  | "expr.simplify"
  | "expr.add"
  | "expr.mul"
  | "rational.simplify"
  | "rational.add"
  | "rational.mul"
  | "rational.div"
  | "complex.add"
  | "complex.sub"
  | "complex.mul";

const operations: Array<{ key: AlgebraicOperationKey; label: string; description: string }> = [
  { key: "expr.simplify", label: "式 / 簡約", description: "式を簡約します。" },
  { key: "expr.add", label: "式 / 加算", description: "式の二項演算です。" },
  { key: "expr.mul", label: "式 / 乗算", description: "式の二項演算です。" },
  { key: "rational.simplify", label: "有理数 / 簡約", description: "有理数を簡約します。" },
  { key: "rational.add", label: "有理数 / 加算", description: "有理数の二項演算です。" },
  { key: "rational.mul", label: "有理数 / 乗算", description: "有理数の二項演算です。" },
  { key: "rational.div", label: "有理数 / 除算", description: "有理数の二項演算です。" },
  { key: "complex.add", label: "複素数 / 加算", description: "複素数の二項演算です。" },
  { key: "complex.sub", label: "複素数 / 減算", description: "複素数の二項演算です。" },
  { key: "complex.mul", label: "複素数 / 乗算", description: "複素数の二項演算です。" },
];

export const AlgebraicOperations = () => {
  const [selected, setSelected] = useState<AlgebraicOperationKey>("expr.simplify");
  const selectedOp = operations.find((o) => o.key === selected);

  return (
    <Stack gap={"lg"}>
      <Stack gap={"sm"}>
        <Text>演算</Text>
        <Select
          value={selected}
          onChange={(e) => setSelected(e.target.value as AlgebraicOperationKey)}
          options={operations.map((o) => ({ value: o.key, label: o.label }))}
        />
        {selectedOp && <Text className="text-muted-foreground">{selectedOp.description}</Text>}
      </Stack>

      {selected === "expr.simplify" && <SimplifyOperation />}
      {selected === "expr.add" && <ExprBinaryOperation op="add" />}
      {selected === "expr.mul" && <ExprBinaryOperation op="mul" />}

      {selected === "rational.simplify" && <RationalSimplifyOperation />}
      {selected === "rational.add" && <RationalBinaryOperation op="add" />}
      {selected === "rational.mul" && <RationalBinaryOperation op="mul" />}
      {selected === "rational.div" && <RationalBinaryOperation op="div" />}

      {selected === "complex.add" && <ComplexBinaryOperation op="add" />}
      {selected === "complex.sub" && <ComplexBinaryOperation op="sub" />}
      {selected === "complex.mul" && <ComplexBinaryOperation op="mul" />}
    </Stack>
  );
};
