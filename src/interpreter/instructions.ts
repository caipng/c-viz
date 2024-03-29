import {
  BinaryOperator,
  TypedExpression,
  Identifier,
  UnaryOperator,
} from "../ast/types";
import { ArithmeticType, ObjectTypeInfo } from "../typing/types";
import { AgendaItem, isInstruction } from "./agenda";

export enum InstructionType {
  UNARY_OP = "UnaryOp",
  BINARY_OP = "BinaryOp",
  POP = "Pop",
  ASSIGN = "Assign",
  MARK = "Mark",
  EXIT = "Exit",
  CALL = "Call",
  RETURN = "Return",
  BRANCH = "Branch",
  ARITHMETIC_CONVERSION = "ArithmeticConversion",
}

export interface BaseInstruction {
  type: InstructionType;
}

export interface UnaryOpInstruction extends BaseInstruction {
  type: InstructionType.UNARY_OP;
  op: UnaryOperator;
}

export const unaryOpInstruction = (op: UnaryOperator): UnaryOpInstruction => ({
  type: InstructionType.UNARY_OP,
  op,
});

export interface BinaryOpInstruction extends BaseInstruction {
  type: InstructionType.BINARY_OP;
  op: BinaryOperator;
}

export const binaryOpInstruction = (
  op: BinaryOperator,
): BinaryOpInstruction => ({
  type: InstructionType.BINARY_OP,
  op,
});

export interface PopInstruction extends BaseInstruction {
  type: InstructionType.POP;
}

export const popInstruction = (): PopInstruction => ({
  type: InstructionType.POP,
});

export interface AssignInstruction extends BaseInstruction {
  type: InstructionType.ASSIGN;
  identifier: Identifier;
  typeInfo: ObjectTypeInfo;
}

export const assignInstruction = (
  identifier: Identifier,
  typeInfo: ObjectTypeInfo,
): AssignInstruction => ({
  type: InstructionType.ASSIGN,
  identifier,
  typeInfo,
});

export interface MarkInstruction extends BaseInstruction {
  type: InstructionType.MARK;
}

export const markInstruction = (): MarkInstruction => ({
  type: InstructionType.MARK,
});

export function isMarkInstruction(i: AgendaItem): i is MarkInstruction {
  return isInstruction(i) && i.type == InstructionType.MARK;
}

export interface ExitInstruction extends BaseInstruction {
  type: InstructionType.EXIT;
}

export const exitInstruction = (): ExitInstruction => ({
  type: InstructionType.EXIT,
});

export interface CallInstruction extends BaseInstruction {
  type: InstructionType.CALL;
  arity: number;
}

export const callInstruction = (arity: number): CallInstruction => ({
  type: InstructionType.CALL,
  arity,
});

export const isCallInstruction = (i: Instruction): i is CallInstruction =>
  i.type === InstructionType.CALL;

export interface ReturnInstruction extends BaseInstruction {
  type: InstructionType.RETURN;
}

export const returnInstruction = (): ReturnInstruction => ({
  type: InstructionType.RETURN,
});

export interface BranchInstruction extends BaseInstruction {
  type: InstructionType.BRANCH;
  exprIfTrue: TypedExpression;
  exprIfFalse: TypedExpression;
}

export const branchInstruction = (
  exprIfTrue: TypedExpression,
  exprIfFalse: TypedExpression,
): BranchInstruction => ({
  type: InstructionType.BRANCH,
  exprIfTrue,
  exprIfFalse,
});

export interface ArithmeticConversionInstruction extends BaseInstruction {
  type: InstructionType.ARITHMETIC_CONVERSION;
  typeInfo: ArithmeticType;
}

export const arithmeticConversionInstruction = (
  typeInfo: ArithmeticType,
): ArithmeticConversionInstruction => ({
  type: InstructionType.ARITHMETIC_CONVERSION,
  typeInfo,
});

export type Instruction =
  | UnaryOpInstruction
  | BinaryOpInstruction
  | PopInstruction
  | MarkInstruction
  | ExitInstruction
  | CallInstruction
  | ReturnInstruction
  | BranchInstruction
  | AssignInstruction
  | ArithmeticConversionInstruction;
