import { has } from "lodash";
import {
  TypedTranslationUnit,
  TypedPrimaryExprIdentifier,
  TypedASTNode,
} from "../ast/types";
import { functionType, int } from "../typing/types";
import { Stack } from "../utils";
import { exitInstruction, callInstruction, Instruction } from "./instructions";

export type AgendaItem = TypedASTNode | Instruction;

export function isASTNode(i: AgendaItem): i is TypedASTNode {
  return has(i, "src");
}

export function isInstruction(i: AgendaItem): i is Instruction {
  return !isASTNode(i);
}

export class Agenda extends Stack<AgendaItem> {
  constructor(program: TypedTranslationUnit) {
    super();

    const mainFunction: TypedPrimaryExprIdentifier = {
      type: "PrimaryExprIdentifier",
      start: {
        offset: 0,
        column: 0,
        line: 0,
      },
      end: {
        offset: 1,
        column: 1,
        line: 0,
      },
      src: "main",
      value: "main",
      lvalue: false,
      typeInfo: functionType(int(), []),
    };

    this.push(exitInstruction());
    this.push(callInstruction(0));
    this.push(mainFunction);
    this.push(program);
  }
}
