import { Identifier } from "../ast/types";
import { roundUpM } from "../utils";
import {
  CHAR_ALIGN,
  CHAR_SIZE,
  INT_ALIGN,
  INT_SIZE,
  LLONG_ALIGN,
  LLONG_SIZE,
  LONG_ALIGN,
  LONG_SIZE,
  SCHAR_ALIGN,
  SCHAR_SIZE,
  SHRT_ALIGN,
  SHRT_SIZE,
  UCHAR_ALIGN,
  UCHAR_SIZE,
  UINT_ALIGN,
  UINT_SIZE,
  ULLONG_ALIGN,
  ULLONG_SIZE,
  ULONG_ALIGN,
  ULONG_SIZE,
  USHRT_ALIGN,
  USHRT_SIZE,
} from "./../constants";

export enum Type {
  _Bool = "bool",
  Char = "char",
  SignedChar = "signed char",
  UnsignedChar = "unsigned char",
  ShortInt = "short",
  UnsignedShortInt = "unsigned short",
  Int = "int",
  UnsignedInt = "unsigned",
  LongInt = "long",
  UnsignedLongInt = "unsigned long",
  LongLongInt = "long long",
  UnsignedLongLongInt = "unsigned long long",

  Void = "void",

  Array = "array",
  Structure = "struct",
  Function = "function",
  Pointer = "ptr",
}

export const getTypeName = (i: Type): string => i;

// types are partitioned into object types (fully describes object),
// function types (describes function), and incomplete types (lack info to determine sizes)

export type ObjectType =
  | Type._Bool
  | Type.Char
  | Type.SignedChar
  | Type.UnsignedChar
  | Type.ShortInt
  | Type.UnsignedShortInt
  | Type.Int
  | Type.UnsignedInt
  | Type.LongInt
  | Type.UnsignedLongInt
  | Type.LongLongInt
  | Type.UnsignedLongLongInt
  | Type.Array
  | Type.Structure
  | Type.Pointer;

export type IncompleteType = Type.Void;

export type SignedIntegerType =
  | SignedChar
  | ShortInt
  | Int
  | LongInt
  | LongLongInt;

export const isSignedIntegerType = (t: TypeInfo): t is SignedIntegerType =>
  isSignedChar(t) ||
  isShortInt(t) ||
  isInt(t) ||
  isLongInt(t) ||
  isLongLongInt(t);

export type UnsignedIntegerType =
  | _Bool
  | UnsignedChar
  | UnsignedShortInt
  | UnsignedInt
  | UnsignedLongInt
  | UnsignedLongLongInt;

export const isUnsignedIntegerType = (t: TypeInfo): t is UnsignedIntegerType =>
  isBool(t) ||
  isUnsignedChar(t) ||
  isUnsignedShortInt(t) ||
  isUnsignedInt(t) ||
  isUnsignedLongInt(t) ||
  isUnsignedLongLongInt(t);

export type BasicType = Char | SignedIntegerType | UnsignedIntegerType;

export type CharacterType = Char | SignedChar | UnsignedChar;

export type IntegerType = Char | SignedIntegerType | UnsignedIntegerType;

export const isIntegerType = (t: TypeInfo): t is IntegerType =>
  isChar(t) || isSignedIntegerType(t) || isUnsignedIntegerType(t);

export type ArithmeticType = IntegerType;

export const isArithmeticType = (t: TypeInfo): t is ArithmeticType =>
  isIntegerType(t);

export type ScalarType = ArithmeticType | Pointer;

export const isScalarType = (t: TypeInfo): t is ScalarType =>
  isArithmeticType(t) || isPointer(t);

export const isSigned = (t: ScalarType): boolean =>
  isChar(t) || isSignedIntegerType(t);

export type AggregateType = Array | Structure;

export type DerviedDeclaratorType = Array | FunctionType | Pointer;

export interface BaseTypeInfo {
  type: Type;
  isCompatible: (other: TypeInfo) => boolean;
}

export type TypeInfo = ObjectTypeInfo | IncompleteTypeInfo | FunctionTypeInfo;

export interface ObjectTypeInfo extends BaseTypeInfo {
  type: ObjectType;
  size: number; // in bytes
  alignment: number; // should be a power of 2
}

export const isObjectTypeInfo = (i: BaseTypeInfo): i is ObjectTypeInfo =>
  !isIncompleteTypeInfo(i) && !isFunctionTypeInfo(i);

export interface _Bool extends ObjectTypeInfo {
  type: Type._Bool;
  size: typeof CHAR_SIZE;
  alignment: typeof CHAR_ALIGN;
}

export const _bool = (): _Bool => ({
  type: Type._Bool,
  size: CHAR_SIZE,
  alignment: CHAR_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isBool(other);
  },
});

export const isBool = (t: TypeInfo): t is _Bool => t.type === Type._Bool;

export interface Char extends ObjectTypeInfo {
  type: Type.Char;
  size: typeof CHAR_SIZE;
  alignment: typeof CHAR_ALIGN;
}

export const char = (): Char => ({
  type: Type.Char,
  size: CHAR_SIZE,
  alignment: CHAR_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isChar(other);
  },
});

export const isChar = (t: TypeInfo): t is Char => t.type === Type.Char;

export interface SignedChar extends ObjectTypeInfo {
  type: Type.SignedChar;
  size: typeof SCHAR_SIZE;
  alignment: typeof SCHAR_ALIGN;
}

export const signedChar = (): SignedChar => ({
  type: Type.SignedChar,
  size: SCHAR_SIZE,
  alignment: SCHAR_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isSignedChar(other);
  },
});

export const isSignedChar = (t: TypeInfo): t is SignedChar =>
  t.type === Type.SignedChar;

export interface UnsignedChar extends ObjectTypeInfo {
  type: Type.UnsignedChar;
  size: typeof UCHAR_SIZE;
  alignment: typeof UCHAR_ALIGN;
}

export const unsignedChar = (): UnsignedChar => ({
  type: Type.UnsignedChar,
  size: UCHAR_SIZE,
  alignment: UCHAR_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isUnsignedChar(other);
  },
});

export const isUnsignedChar = (t: TypeInfo): t is UnsignedChar =>
  t.type === Type.UnsignedChar;

export interface ShortInt extends ObjectTypeInfo {
  type: Type.ShortInt;
  size: typeof SHRT_SIZE;
  alignment: typeof SHRT_ALIGN;
}

export const shortInt = (): ShortInt => ({
  type: Type.ShortInt,
  size: SHRT_SIZE,
  alignment: SHRT_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isShortInt(other);
  },
});

export const isShortInt = (t: TypeInfo): t is ShortInt =>
  t.type === Type.ShortInt;

export interface UnsignedShortInt extends ObjectTypeInfo {
  type: Type.UnsignedShortInt;
  size: typeof USHRT_SIZE;
  alignment: typeof USHRT_ALIGN;
}

export const unsignedShortInt = (): UnsignedShortInt => ({
  type: Type.UnsignedShortInt,
  size: USHRT_SIZE,
  alignment: USHRT_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isUnsignedShortInt(other);
  },
});

export const isUnsignedShortInt = (t: TypeInfo): t is UnsignedShortInt =>
  t.type === Type.UnsignedShortInt;

export interface Int extends ObjectTypeInfo {
  type: Type.Int;
  size: typeof INT_SIZE;
  alignment: typeof INT_ALIGN;
}

export const int = (): Int => ({
  type: Type.Int,
  size: INT_SIZE,
  alignment: INT_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isInt(other);
  },
});

export const isInt = (t: TypeInfo): t is Int => t.type === Type.Int;

export interface UnsignedInt extends ObjectTypeInfo {
  type: Type.UnsignedInt;
  size: typeof UINT_SIZE;
  alignment: typeof UINT_ALIGN;
}

export const unsignedInt = (): UnsignedInt => ({
  type: Type.UnsignedInt,
  size: UINT_SIZE,
  alignment: UINT_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isUnsignedInt(other);
  },
});

export const isUnsignedInt = (t: TypeInfo): t is UnsignedInt =>
  t.type === Type.UnsignedInt;

export interface LongInt extends ObjectTypeInfo {
  type: Type.LongInt;
  size: typeof LONG_SIZE;
  alignment: typeof LONG_ALIGN;
}

export const longInt = (): LongInt => ({
  type: Type.LongInt,
  size: LONG_SIZE,
  alignment: LONG_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isLongInt(other);
  },
});

export const isLongInt = (t: TypeInfo): t is LongInt => t.type === Type.LongInt;

export interface UnsignedLongInt extends ObjectTypeInfo {
  type: Type.UnsignedLongInt;
  size: typeof ULONG_SIZE;
  alignment: typeof ULONG_ALIGN;
}

export const unsignedLongInt = (): UnsignedLongInt => ({
  type: Type.UnsignedLongInt,
  size: ULONG_SIZE,
  alignment: ULONG_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isUnsignedLongInt(other);
  },
});

export const isUnsignedLongInt = (t: TypeInfo): t is UnsignedLongInt =>
  t.type === Type.UnsignedLongInt;

export interface LongLongInt extends ObjectTypeInfo {
  type: Type.LongLongInt;
  size: typeof LLONG_SIZE;
  alignment: typeof LLONG_ALIGN;
}

export const longLongInt = (): LongLongInt => ({
  type: Type.LongLongInt,
  size: LLONG_SIZE,
  alignment: LLONG_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isLongLongInt(other);
  },
});

export const isLongLongInt = (t: TypeInfo): t is LongLongInt =>
  t.type === Type.LongLongInt;

export interface UnsignedLongLongInt extends ObjectTypeInfo {
  type: Type.UnsignedLongLongInt;
  size: typeof ULLONG_SIZE;
  alignment: typeof ULLONG_ALIGN;
}

export const unsignedLongLongInt = (): UnsignedLongLongInt => ({
  type: Type.UnsignedLongLongInt,
  size: ULLONG_SIZE,
  alignment: ULLONG_ALIGN,
  isCompatible: (other: TypeInfo) => {
    return isUnsignedLongLongInt(other);
  },
});

export const isUnsignedLongLongInt = (t: TypeInfo): t is UnsignedLongLongInt =>
  t.type === Type.UnsignedLongLongInt;

export interface Array extends ObjectTypeInfo {
  type: Type.Array;
  elementType: ObjectTypeInfo;
  length: number;
}

export const array = (elementType: ObjectTypeInfo, length: number): Array => ({
  type: Type.Array,
  size: elementType.size * length,
  alignment: elementType.alignment,
  elementType,
  length,
  isCompatible: (other: TypeInfo) => {
    return (
      isArray(other) &&
      length === other.length &&
      elementType.isCompatible(other.elementType)
    );
  },
});

export const isArray = (t: TypeInfo): t is Array => t.type === Type.Array;

export interface StructureMember {
  name?: string;
  type: ObjectTypeInfo;
}

export interface Structure extends ObjectTypeInfo {
  type: Type.Structure;
  tag?: string;
  members: StructureMember[];
}

export const structure = (
  members: StructureMember[],
  tag?: string,
): Structure => {
  // the alignment of a structure must be at least as strict as the alignment of its strictest member
  const strictestAlignment = Math.max(...members.map((m) => m.type.alignment));

  let currAddr = 0; // next free addr
  for (const m of members) {
    currAddr = roundUpM(currAddr, m.type.alignment);
    currAddr += m.type.size;
  }
  // add padding at end for array of struct
  currAddr = roundUpM(currAddr, strictestAlignment);

  const res: Structure = {
    type: Type.Structure,
    size: currAddr,
    alignment: strictestAlignment,
    members,
    isCompatible: (other: TypeInfo) => {
      return (
        isStructure(other) &&
        other.tag === tag &&
        other.members.length === members.length &&
        other.members.reduce(
          (A, m, i) =>
            A &&
            m.name === members[i].name &&
            m.type.isCompatible(members[i].type),
          true,
        )
      );
    },
  };
  if (tag) res.tag = tag;
  return res;
};

export const isStructure = (t: TypeInfo): t is Structure =>
  t.type === Type.Structure;

export interface Pointer extends ObjectTypeInfo {
  type: Type.Pointer;
  // for simplicity we let all pointers have same size and alignment requirements (see 6.2.5.27)
  size: typeof INT_SIZE;
  alignment: typeof INT_ALIGN;
  referencedType: TypeInfo;
}

export const pointer = (referencedType: TypeInfo): Pointer => ({
  type: Type.Pointer,
  size: INT_SIZE,
  alignment: INT_ALIGN,
  referencedType,
  isCompatible: (other: TypeInfo) => {
    return (
      isPointer(other) && other.referencedType.isCompatible(referencedType)
    );
  },
});

export const isPointer = (t: TypeInfo): t is Pointer => t.type === Type.Pointer;

export interface IncompleteTypeInfo extends BaseTypeInfo {
  type: IncompleteType;
}

export const isIncompleteTypeInfo = (
  i: BaseTypeInfo,
): i is IncompleteTypeInfo => i.type === Type.Void;

export interface Void extends IncompleteTypeInfo {
  type: Type.Void;
}

export const voidType = (): Void => ({
  type: Type.Void,
  isCompatible: (other: TypeInfo) => {
    return isVoid(other);
  },
});

export const isVoid = (t: TypeInfo): t is Void => t.type === Type.Void;

export interface FunctionTypeInfo extends BaseTypeInfo {
  type: Type.Function;
}

export const isFunctionTypeInfo = (i: BaseTypeInfo): i is FunctionTypeInfo =>
  i.type === Type.Function;

// (6.7.5.3.1) A function declarator shall not specify a return type that is a function type or an array type
export type FunctionReturnType = Exclude<TypeInfo, FunctionTypeInfo>;

export interface ParameterTypeAndIdentifier {
  identifier: Identifier | null;
  type: ObjectTypeInfo;
}

export interface FunctionType extends FunctionTypeInfo {
  type: Type.Function;
  returnType: FunctionReturnType;
  arity: number;
  parameterTypes: ParameterTypeAndIdentifier[];
}

export const functionType = (
  returnType: FunctionReturnType,
  parameterTypes: { identifier: Identifier | null; type: TypeInfo }[],
): FunctionType => {
  if (isArray(returnType)) throw "function cannot return array type";

  for (const t of parameterTypes) {
    if (isVoid(t.type) && parameterTypes.length > 1) {
      throw "function parameter cannot be an incomplete type (void), except for the case of void being the only parameter to indicate that the function has no parameters";
    }
  }

  let res: Omit<FunctionType, "isCompatible">;
  if (parameterTypes.length === 0 || isVoid(parameterTypes[0].type)) {
    res = {
      type: Type.Function,
      returnType,
      arity: 0,
      parameterTypes: [],
    };
  } else {
    const adjustedParameterTypes: ParameterTypeAndIdentifier[] = [];
    for (const i of parameterTypes) {
      const t = i.type;
      let adjustedType: ObjectTypeInfo;
      if (isArray(t)) {
        // A declaration of a parameter as array of type shall be adjusted to qualified pointer to type
        adjustedType = pointer(t.elementType);
      } else if (isFunction(t)) {
        // A declaration of a parameter as function returning type shall be adjusted to pointer to function returning type
        adjustedType = pointer(t);
      } else {
        adjustedType = t as ObjectTypeInfo;
      }
      adjustedParameterTypes.push({ ...i, type: adjustedType });
    }
    res = {
      type: Type.Function,
      returnType,
      arity: adjustedParameterTypes.length,
      parameterTypes: adjustedParameterTypes,
    };
  }

  return {
    ...res,
    isCompatible: (other: TypeInfo): boolean => {
      return (
        isFunction(other) &&
        other.returnType.isCompatible(returnType) &&
        other.arity === res.arity &&
        other.parameterTypes.reduce(
          (A, p, i) => A && p.type.isCompatible(res.parameterTypes[i].type),
          true,
        )
      );
    },
  };
};

export const isFunction = (t: TypeInfo): t is FunctionType =>
  t.type === Type.Function;
