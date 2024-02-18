import { Stack, getIdentifierFromDeclarator } from "./utils";
import { has } from "lodash";

interface PositionInfo {
  offset: number;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
  start: PositionInfo;
  end: PositionInfo;
  src: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // todo: improve typing?
}

export function isASTNode(i: AgendaItem): i is ASTNode {
  return (i as ASTNode).src !== undefined;
}

export function isInstruction(i: AgendaItem): i is Instruction {
  return !isASTNode(i);
}

enum InstructionType {
  BINARY_OP = "BinaryOperation",
  POP = "Pop",
  ASSIGN = "Assign",
}

interface BaseInstruction {
  type: InstructionType;
}

type BinaryOperator = "+" | "-" | "*" | "/" | "%";

interface BinaryOpInstruction extends BaseInstruction {
  op: BinaryOperator;
}

const binaryOpInstruction = (op: BinaryOperator): BinaryOpInstruction => ({
  type: InstructionType.BINARY_OP,
  op,
});

interface PopInstruction extends BaseInstruction {}

const popInstruction = (): PopInstruction => ({ type: InstructionType.POP });

interface AssignInstruction extends BaseInstruction {
  identifier: string;
}

const assignInstruction = (identifier: string): AssignInstruction => ({
  type: InstructionType.ASSIGN,
  identifier,
});

type Instruction = BinaryOpInstruction | PopInstruction;

export type AgendaItem = ASTNode | Instruction;

export class Agenda extends Stack<AgendaItem> {
  constructor(program: ASTNode) {
    super();
    this.push(program);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Stash extends Stack<any> {}

export interface Declaration {
  identifier: string;
  specifiers: string;
  isPtr: boolean;
  value: unknown;
}

export interface Runtime {
  agenda: Agenda;
  stash: Stash;
  externalDeclarations: Declaration[];
  AST: ASTNode;
}

export function evaluate(program: ASTNode): Runtime {
  return {
    agenda: new Agenda(program),
    stash: new Stash(),
    externalDeclarations: [],
    AST: program,
  };
}

export function evaluateNext(rt: Runtime): Runtime {
  if (rt.agenda.isEmpty()) throw new RangeError("agenda is empty");
  const i = rt.agenda.pop();
  const type = i.type in ASTNodeTypeAlias ? ASTNodeTypeAlias[i.type] : i.type;
  if (!(type in agendaItemEvaluator)) {
    throw new Error("not implemented");
  }
  agendaItemEvaluator[type](rt, i);
  return rt;
}

const ASTNodeTypeAlias: { [type: string]: string } = {
  // DecimalConstant: "Constant",
  // DecimalFloatConstant: "Constant",
};

const agendaItemEvaluator: {
  [type: string]: (rt: Runtime, i: AgendaItem) => void;
} = {
  TranslationUnit: (rt: Runtime, i: ASTNode) => {
    const extDeclarations = i.value;
    for (const i of extDeclarations.reverse()) {
      rt.agenda.push(i);
    }
  },
  Declaration: (rt: Runtime, { declaratorList, specifiers }: ASTNode) => {
    if (declaratorList.length == 1) {
      agendaItemEvaluator["InitDeclarator"](rt, {
        ...declaratorList[0],
        specifiers,
      });
      return;
    }
    for (const initDeclarator of declaratorList) {
      rt.agenda.push({
        ...initDeclarator,
        specifiers,
      } as ASTNode);
    }
  },
  InitDeclarator: (
    rt: Runtime,
    { declarator, initializer, specifiers }: ASTNode,
  ) => {
    const { value: identifier } = getIdentifierFromDeclarator(declarator);
    rt.externalDeclarations.push({
      specifiers: specifiers.join(" "),
      identifier: identifier,
      isPtr: declarator.ptr !== null,
      value: undefined,
    });
    if (initializer) {
      rt.agenda.push(popInstruction());
      rt.agenda.push(assignInstruction(identifier));
      rt.agenda.push(initializer.value);
    }
  },
  BinaryExpr: (rt: Runtime, { left, op, right }: ASTNode) => {
    rt.agenda.push(binaryOpInstruction(op));
    rt.agenda.push(has(right, "expression") ? right.expression : right);
    rt.agenda.push(has(left, "expression") ? left.expression : left);
  },
  PrimaryExprConstant: (rt: Runtime, { value }: ASTNode) => {
    if (typeof value === "object") throw new Error("not implemented");
    rt.stash.push(value);
  },
  [InstructionType.BINARY_OP]: (rt: Runtime, { op }: BinaryOpInstruction) => {
    const right = rt.stash.pop();
    const left = rt.stash.pop();
    let res;
    switch (op) {
      case "+":
        res = left + right;
        break;
      case "-":
        res = left - right;
        break;
      case "*":
        res = left * right;
        break;
      case "/":
        res = left / right;
        break;
      case "%":
        res = left % right;
        break;
    }
    rt.stash.push(res);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [InstructionType.POP]: (rt: Runtime, _: PopInstruction) => {
    rt.stash.pop();
  },
  [InstructionType.ASSIGN]: (
    rt: Runtime,
    { identifier }: AssignInstruction,
  ) => {
    for (const i of rt.externalDeclarations) {
      if (i.identifier === identifier) {
        i.value = rt.stash.peek();
      }
    }
  },
};
