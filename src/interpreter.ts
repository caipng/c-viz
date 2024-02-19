import {
  Stack,
  getIdentifierFromDeclarator,
  getParamsFromDeclarator,
  getRandAddress,
} from "./utils";
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
  BINARY_OP = "BinaryOp",
  POP = "Pop",
  ASSIGN = "Assign",
  ENTRY = "Entry",
  MARK = "Mark",
  EXIT = "Exit",
  CALL = "Call",
  RETURN = "Return",
  BRANCH = "Branch",
}

interface BaseInstruction {
  type: InstructionType;
}

type BinaryOperator = "+" | "-" | "*" | "/" | "%" | ">" | "<";

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

interface EntryInstruction extends BaseInstruction {}

const entryInstruction = (): EntryInstruction => ({
  type: InstructionType.ENTRY,
});

interface MarkInstruction extends BaseInstruction {}

const markInstruction = (): MarkInstruction => ({
  type: InstructionType.MARK,
});

function isMarkInstruction(i: AgendaItem): i is MarkInstruction {
  return isInstruction(i) && i.type == InstructionType.MARK;
}

interface ExitInstruction extends BaseInstruction {}

const exitInstruction = (): MarkInstruction => ({
  type: InstructionType.EXIT,
});

interface CallInstruction extends BaseInstruction {
  arity: number;
}

const callInstruction = (arity: number): CallInstruction => ({
  type: InstructionType.CALL,
  arity,
});

interface ReturnInstruction extends BaseInstruction {}

const returnInstruction = (): ReturnInstruction => ({
  type: InstructionType.RETURN,
});

interface BranchInstruction extends BaseInstruction {
  exprIfTrue: ASTNode;
  exprIfFalse: ASTNode;
}

const branchInstruction = (
  exprIfTrue: ASTNode,
  exprIfFalse: ASTNode,
): BranchInstruction => ({
  type: InstructionType.BRANCH,
  exprIfTrue,
  exprIfFalse,
});

type Instruction =
  | BinaryOpInstruction
  | PopInstruction
  | EntryInstruction
  | MarkInstruction
  | ExitInstruction
  | CallInstruction
  | ReturnInstruction
  | BranchInstruction;

export type AgendaItem = ASTNode | Instruction;

export class Agenda extends Stack<AgendaItem> {
  constructor(program: ASTNode) {
    super();
    this.push(entryInstruction());
    this.push(program);
  }
}

export interface StashItem {
  type: "value" | "ptr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export class Stash extends Stack<StashItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pushValue(value: any): void {
    this.push({ type: "value", value });
  }

  pushPtr(addr: number): void {
    this.push({ type: "ptr", value: addr });
  }
}

export interface Declarator {
  identifier: string;
  isPtr: boolean;
}

export interface Declaration extends Declarator {
  specifiers: string;
  sizeof: number;
  address: number;
  value: unknown;
  rawValue: number;
}

export interface ParameterDeclaration extends Declarator {
  specifiers: string;
}

export interface FunctionDeclaration extends Declaration {
  params: ParameterDeclaration[];
  varargs: boolean;
}

export function isFunctionDeclaration(
  d: Declaration,
): d is FunctionDeclaration {
  return has(d, "params");
}

export interface SymbolTable {
  [identifier: string]: Declaration;
}

export interface Memory {
  [address: number]: Declaration;
}

export interface Runtime {
  agenda: Agenda;
  stash: Stash;
  externalDeclarations: Declaration[];
  AST: ASTNode;
  symTable: SymbolTable[];
  memory: Memory;
  exitCode: number | undefined;
}

function lookup(t: SymbolTable[], identifier: string): Declaration {
  for (let i = t.length - 1; i >= 0; i--) {
    if (identifier in t[i]) {
      return t[i][identifier];
    }
  }
  throw new Error("no declaration found");
}

export function evaluate(program: ASTNode): Runtime {
  return {
    agenda: new Agenda(program),
    stash: new Stash(),
    externalDeclarations: [],
    AST: program,
    symTable: [{}],
    memory: {},
    exitCode: undefined,
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
    for (let i = declaratorList.length - 1; i >= 0; i--) {
      rt.agenda.push({
        ...declaratorList[i],
        specifiers,
      } as ASTNode);
    }
  },
  InitDeclarator: (
    rt: Runtime,
    { declarator, initializer, specifiers }: ASTNode,
  ) => {
    const { value: identifier } = getIdentifierFromDeclarator(declarator);
    const res: Declaration = {
      specifiers: specifiers.join(" "),
      identifier,
      isPtr: declarator.ptr !== null,
      value: 0,
      rawValue: 0,
      sizeof: 0,
      address: getRandAddress(),
    };
    const { varargs, params, ok } = getParamsFromDeclarator(declarator);

    if (ok) {
      rt.externalDeclarations.push({
        ...res,
        varargs,
        params,
      } as FunctionDeclaration);
      rt.symTable[0][identifier] = rt.externalDeclarations.at(-1);
      rt.memory[res.address] = rt.externalDeclarations.at(-1);
    } else {
      res.sizeof = 8;
      rt.externalDeclarations.push(res);
      rt.symTable[0][identifier] = rt.externalDeclarations.at(-1);
      rt.memory[res.address] = rt.externalDeclarations.at(-1);
      if (initializer) {
        rt.agenda.push(popInstruction());
        rt.agenda.push(assignInstruction(identifier));
        rt.agenda.push(initializer.value);
      }
    }
  },
  FunctionDefinition: (
    rt: Runtime,
    { specifiers, declarator, body }: ASTNode,
  ) => {
    const { value: identifier } = getIdentifierFromDeclarator(declarator);
    for (const d of rt.externalDeclarations) {
      if (d.identifier == identifier) {
        d.value = body;
        return;
      }
    }
    const { varargs, params } = getParamsFromDeclarator(declarator);
    const res: FunctionDeclaration = {
      specifiers: specifiers.join(" "),
      identifier,
      isPtr: declarator.ptr !== null,
      value: body,
      rawValue: 0,
      sizeof: 0,
      address: getRandAddress(),
      varargs,
      params,
    };
    rt.externalDeclarations.push(res);
    rt.symTable[0][identifier] = rt.externalDeclarations.at(-1);
    rt.memory[res.address] = rt.externalDeclarations.at(-1);
  },
  BinaryExpr: (rt: Runtime, { left, op, right }: ASTNode) => {
    rt.agenda.push(binaryOpInstruction(op));
    rt.agenda.push(has(right, "expression") ? right.expression : right);
    rt.agenda.push(has(left, "expression") ? left.expression : left);
  },
  PrimaryExprConstant: (rt: Runtime, { value }: ASTNode) => {
    if (typeof value === "object") throw new Error("not implemented");
    rt.stash.pushValue(value);
  },
  PrimaryExprIdentifier: (rt: Runtime, { value: identifier }: ASTNode) => {
    const d = lookup(rt.symTable, identifier);
    if (isFunctionDeclaration(d)) {
      rt.stash.pushPtr(d.address);
    } else {
      rt.stash.pushValue(d.value);
    }
  },
  CompoundStatement: (rt: Runtime, { value: stmts }: ASTNode) => {
    for (let i = stmts.length - 1; i >= 0; i--) {
      rt.agenda.push(stmts[i]);
    }
  },
  PostfixExpression: (rt: Runtime, { expr, ops }: ASTNode) => {
    for (let i = ops.length - 1; i >= 0; i--) {
      rt.agenda.push(ops[i]);
    }
    rt.agenda.push(expr);
  },
  FunctionCall: (rt: Runtime, { value: args }: ASTNode) => {
    rt.agenda.push(callInstruction(args.length));
    for (let i = args.length - 1; i >= 0; i--) {
      rt.agenda.push(args[i]);
    }
  },
  JumpStatementReturn: (rt: Runtime, { value: expr }: ASTNode) => {
    rt.agenda.push(returnInstruction());
    rt.agenda.push(expr);
  },
  ConditionalExpression: (
    rt: Runtime,
    { cond, exprIfTrue, exprIfFalse }: ASTNode,
  ) => {
    rt.agenda.push(branchInstruction(exprIfTrue, exprIfFalse));
    rt.agenda.push(cond);
  },
  [InstructionType.BINARY_OP]: (rt: Runtime, { op }: BinaryOpInstruction) => {
    const right = rt.stash.pop().value;
    const left = rt.stash.pop().value;
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
      case ">":
        res = left > right;
        break;
      case "<":
        res = left < right;
        break;
    }
    rt.stash.pushValue(res);
  },
  [InstructionType.POP]: (rt: Runtime) => {
    rt.stash.pop();
  },
  [InstructionType.ASSIGN]: (
    rt: Runtime,
    { identifier }: AssignInstruction,
  ) => {
    for (const i of rt.externalDeclarations) {
      if (i.identifier === identifier) {
        i.value = rt.stash.peek().value;
        i.rawValue = i.value as number;
      }
    }
  },
  [InstructionType.ENTRY]: (rt: Runtime) => {
    for (const i of rt.externalDeclarations) {
      if (i.identifier === "main") {
        if (i.value === 0) {
          throw new Error("main function not defined");
        }
        rt.agenda.push(exitInstruction());
        rt.agenda.push(markInstruction());
        const compoundStatement: ASTNode = i.value as ASTNode;
        if (compoundStatement.value.length === 1) {
          rt.agenda.push(compoundStatement.value[0]);
        } else {
          rt.agenda.push(compoundStatement);
        }
        return;
      }
    }
    throw new Error("main function not found");
  },
  [InstructionType.RETURN]: (rt: Runtime) => {
    while (!isMarkInstruction(rt.agenda.peek())) rt.agenda.pop();
    rt.agenda.pop();
    rt.symTable.pop();
  },
  [InstructionType.EXIT]: (rt: Runtime) => {
    rt.exitCode = rt.stash.pop().value as number;
  },
  [InstructionType.CALL]: (rt: Runtime, { arity }: CallInstruction) => {
    let args = [];
    for (let i = 0; i < arity; i++) {
      args.push(rt.stash.pop().value);
    }
    args = args.reverse();

    const fnAddress = rt.stash.pop().value as number;
    const fnDecl = rt.memory[fnAddress] as FunctionDeclaration;
    rt.agenda.push(markInstruction());
    const compoundStatement = fnDecl.value as ASTNode;
    if (compoundStatement.value.length === 1) {
      rt.agenda.push(compoundStatement.value[0]);
    } else {
      rt.agenda.push(compoundStatement);
    }

    const sf: SymbolTable = {};
    for (let i = 0; i < arity; i++) {
      const paramDecl = fnDecl.params[i];
      const d: Declaration = {
        ...paramDecl,
        sizeof: 8,
        address: getRandAddress(),
        value: args[i],
        rawValue: 0,
      };
      sf[paramDecl.identifier] = d;
      rt.memory[d.address] = d;
    }
    rt.symTable.push(sf);
  },
  [InstructionType.BRANCH]: (
    rt: Runtime,
    { exprIfTrue, exprIfFalse }: BranchInstruction,
  ) => {
    if (rt.stash.pop().value) {
      rt.agenda.push(exprIfTrue);
    } else {
      rt.agenda.push(exprIfFalse);
    }
  },
};
