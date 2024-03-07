import { has } from "lodash";
import {
  ASTNode,
  CompoundStatement,
  DeclarationSpecifiers,
  Declarator,
  Identifier,
  ParameterDeclaration,
  TranslationUnit,
} from "../ast/types";
import { Instruction } from "./instructions";
import { Agenda, Stash } from "./interpreter";

export type AgendaItem = ASTNode | Instruction;

export interface StashItem {
  type: "value" | "ptr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export function isASTNode(i: AgendaItem): i is ASTNode {
  return has(i, "src");
}

export function isInstruction(i: AgendaItem): i is Instruction {
  return !isASTNode(i);
}

export interface Declaration {
  declarator: Declarator;
  specifiers: DeclarationSpecifiers;
}

export interface RuntimeObject extends Declaration {
  identifier: Identifier;
  sizeof: number;
  address: number;
  value: unknown;
  rawValue: number;
  isFunction: boolean;
}

export interface FunctionDefinition extends RuntimeObject {
  sizeof: 1;
  value: CompoundStatement | undefined;
  isFunction: true;
  params: ParameterDeclaration[];
}

export function isFunction(i: RuntimeObject): i is FunctionDefinition {
  return i.isFunction;
}

export interface SymbolTable {
  [identifier: Identifier]: RuntimeObject;
}

export interface Memory {
  [address: number]: RuntimeObject;
}

export interface Runtime {
  agenda: Agenda;
  stash: Stash;
  externalDeclarations: RuntimeObject[];
  AST: TranslationUnit;
  symTable: SymbolTable[];
  memory: Memory;
  exitCode: number | undefined;
  currDeclarationSpecifiers: DeclarationSpecifiers;
}
