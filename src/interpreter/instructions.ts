import { BinaryOperator, Expression, Identifier } from "../ast/types";
import { AgendaItem, isInstruction } from "./types";

export enum InstructionType {
  BINARY_OP = "BinaryOp",
  POP = "Pop",
  ASSIGN = "Assign",
  MARK = "Mark",
  EXIT = "Exit",
  CALL = "Call",
  RETURN = "Return",
  BRANCH = "Branch",
}

export interface BaseInstruction {
  type: InstructionType;
}

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
}

export const assignInstruction = (
  identifier: Identifier,
): AssignInstruction => ({
  type: InstructionType.ASSIGN,
  identifier,
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
  exprIfTrue: Expression;
  exprIfFalse: Expression;
}

export const branchInstruction = (
  exprIfTrue: Expression,
  exprIfFalse: Expression,
): BranchInstruction => ({
  type: InstructionType.BRANCH,
  exprIfTrue,
  exprIfFalse,
});

export type Instruction =
  | BinaryOpInstruction
  | PopInstruction
  | MarkInstruction
  | ExitInstruction
  | CallInstruction
  | ReturnInstruction
  | BranchInstruction
  | AssignInstruction;
