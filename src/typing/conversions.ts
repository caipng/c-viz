import { isFunction } from "lodash";
import { TypedExpression, isPrimaryExprString } from "../ast/types";
import { Type, isArray, pointer } from "./types";

export const INTEGRAL_TYPE_TO_CONVERSION_RANK: { [key in Type]?: number } = {
  [Type._Bool]: 0,

  [Type.Char]: 1,
  [Type.SignedChar]: 1,
  [Type.UnsignedChar]: 1,

  [Type.ShortInt]: 2,
  [Type.UnsignedShortInt]: 2,

  [Type.Int]: 3,
  [Type.UnsignedInt]: 3,

  [Type.LongInt]: 4,
  [Type.UnsignedLongInt]: 4,

  [Type.LongLongInt]: 5,
  [Type.UnsignedLongLongInt]: 5,
};

// TODO: see 6.3.2.1 for implicit conversions of array/functions/lvalues and cppref on "implicit conversions"
export const applyImplicitConversions = (
  t: TypedExpression,
): TypedExpression => {
  const t0 = t.typeInfo;
  if (isArray(t0) && !isPrimaryExprString(t)) {
    return { ...t, typeInfo: pointer(t0.elementType), lvalue: false };
  }
  if (isFunction(t0)) {
    return { ...t, typeInfo: pointer(t0) };
  }
  return t;
};
