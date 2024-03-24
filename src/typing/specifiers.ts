import { DeclarationSpecifiers } from "../ast/types";
import {
  CHAR_MAX,
  CHAR_MIN,
  INT_MAX,
  INT_MIN,
  LLONG_MAX,
  LLONG_MIN,
  LONG_MAX,
  LONG_MIN,
  SCHAR_MAX,
  SCHAR_MIN,
  SHRT_MAX,
  SHRT_MIN,
  UCHAR_MAX,
  UINT_MAX,
  ULLONG_MAX,
  ULONG_MAX,
  USHRT_MAX,
} from "../constants";
import {
  TypeInfo,
  UnsignedInt,
  _bool,
  char,
  int,
  longInt,
  longLongInt,
  shortInt,
  signedChar,
  unsignedChar,
  unsignedLongInt,
  unsignedLongLongInt,
  unsignedShortInt,
  voidType,
} from "./types";

export const TYPE_SPECIFIER_TO_TYPE_INFO: Record<string, TypeInfo> = {
  void: voidType(),

  char: char(),

  "signed char": signedChar(),

  "unsigned char": unsignedChar(),

  short: shortInt(),
  "signed short": shortInt(),
  "short int": shortInt(),
  "signed short int": shortInt(),

  "unsigned short": unsignedShortInt(),
  "unsigned short int": unsignedShortInt(),

  int: int(),
  signed: int(),
  "signed int": int(),

  unsigned: UnsignedInt(),
  "unsigned int": UnsignedInt(),

  long: longInt(),
  "signed long": longInt(),
  "long int": longInt(),
  "signed long int": longInt(),

  "unsigned long": unsignedLongInt(),
  "unsigned long int": unsignedLongInt(),

  "long long": longLongInt(),
  "signed long long": longLongInt(),
  "long long int": longLongInt(),
  "signed long long int": longLongInt(),

  "unsigned long long": unsignedLongLongInt(),
  "unsigned long long int": unsignedLongLongInt(),

  _Bool: _bool(),
};

export const TYPE_SPECIFIER_TO_NUMERICAL_LIMIT: Record<
  string,
  [bigint, bigint]
> = {
  char: [CHAR_MIN, CHAR_MAX],

  "signed char": [SCHAR_MIN, SCHAR_MAX],

  "unsigned char": [BigInt(0), UCHAR_MAX],

  short: [SHRT_MIN, SHRT_MAX],
  "signed short": [SHRT_MIN, SHRT_MAX],
  "short int": [SHRT_MIN, SHRT_MAX],
  "signed short int": [SHRT_MIN, SHRT_MAX],

  "unsigned short": [BigInt(0), USHRT_MAX],
  "unsigned short int": [BigInt(0), USHRT_MAX],

  int: [INT_MIN, INT_MAX],
  signed: [INT_MIN, INT_MAX],
  "signed int": [INT_MIN, INT_MAX],

  unsigned: [BigInt(0), UINT_MAX],
  "unsigned int": [BigInt(0), UINT_MAX],

  long: [LONG_MIN, LONG_MAX],
  "signed long": [LONG_MIN, LONG_MAX],
  "long int": [LONG_MIN, LONG_MAX],
  "signed long int": [LONG_MIN, LONG_MAX],

  "unsigned long": [BigInt(0), ULONG_MAX],
  "unsigned long int": [BigInt(0), ULONG_MAX],

  "long long": [LLONG_MIN, LLONG_MAX],
  "signed long long": [LLONG_MIN, LLONG_MAX],
  "long long int": [LLONG_MIN, LLONG_MAX],
  "signed long long int": [LLONG_MIN, LLONG_MAX],

  "unsigned long long": [BigInt(0), ULLONG_MAX],
  "unsigned long long int": [BigInt(0), ULLONG_MAX],

  _Bool: [BigInt(0), BigInt(1)],
};

const unorderedCompare = (s1: string, s2: string): boolean =>
  s1.split(" ").sort().join(" ") === s2.split(" ").sort().join(" ");

export const getTypeInfoFromSpecifiers = (
  ls: DeclarationSpecifiers,
): TypeInfo => {
  if (ls.length === 0) throw "at least one type specifier must be given";

  const s = ls.join(" ");
  for (const specifier in TYPE_SPECIFIER_TO_TYPE_INFO) {
    if (unorderedCompare(s, specifier)) {
      return TYPE_SPECIFIER_TO_TYPE_INFO[specifier];
    }
  }

  throw (
    "unknown type specifier, expected one of " +
    JSON.stringify(Object.keys(TYPE_SPECIFIER_TO_TYPE_INFO))
  );
};

export const getNumericalLimitFromSpecifiers = (
  s: string,
): [bigint, bigint] => {
  for (const specifier in TYPE_SPECIFIER_TO_NUMERICAL_LIMIT) {
    if (unorderedCompare(s, specifier)) {
      return TYPE_SPECIFIER_TO_NUMERICAL_LIMIT[specifier];
    }
  }

  throw (
    "unknown type specifier, expected one of " +
    JSON.stringify(Object.keys(TYPE_SPECIFIER_TO_NUMERICAL_LIMIT))
  );
};
