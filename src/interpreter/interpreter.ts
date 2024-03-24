import {
  CompoundStatement,
  Declaration as DeclarationAST,
  Identifier,
  PrimaryExprIdentifier,
  TranslationUnit,
  InitDeclarator,
  BinaryExpressionNode,
  PrimaryExprConstant,
  PostfixExpressionNode,
  PrimaryExprParenthesis,
  FunctionCallOp,
  JumpStatementReturn,
  ConditionalExpressionNode,
  FunctionDefinition as FunctionDefinitionAST,
  ASTNode,
  CommaOperator,
} from "../ast/types";
import {
  AssignInstruction,
  BinaryOpInstruction,
  BranchInstruction,
  CallInstruction,
  Instruction,
  InstructionType,
  assignInstruction,
  binaryOpInstruction,
  branchInstruction,
  callInstruction,
  exitInstruction,
  isMarkInstruction,
  markInstruction,
  popInstruction,
  returnInstruction,
} from "./instructions";
import {
  Stack,
  getIdentifierFromDeclarator,
  getParamsFromFunctionDeclarator,
  getRandAddress,
  isFunctionDeclarator,
} from "../utils";
import {
  AgendaItem,
  FunctionDefinition,
  Memory,
  Runtime,
  RuntimeObject,
  StashItem,
  SymbolTable,
  isFunction,
  isInstruction,
} from "./types";

export class Agenda extends Stack<AgendaItem> {
  constructor(program: TranslationUnit) {
    super();

    const mainFunction: PrimaryExprIdentifier = {
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
    };

    this.push(exitInstruction());
    this.push(callInstruction(0));
    this.push(mainFunction);
    this.push(program);
  }
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

export class RuntimeView {
  agenda: AgendaItem[];
  stash: StashItem[];
  externalDeclarations: RuntimeObject[];
  symTable: SymbolTable[];
  memory: Memory;
  exitCode: number | undefined;

  constructor(rt: Runtime) {
    this.agenda = rt.agenda.getArr();
    this.stash = rt.stash.getArr();
    this.externalDeclarations = structuredClone(rt.externalDeclarations);
    this.symTable = structuredClone(rt.symTable);
    this.memory = structuredClone(rt.memory);
    this.exitCode = rt.exitCode;
  }
}

function lookup(t: SymbolTable[], identifier: Identifier): RuntimeObject {
  for (let i = t.length - 1; i >= 0; i--) {
    if (identifier in t[i]) {
      return t[i][identifier];
    }
  }
  throw new Error("no declaration found");
}

export function evaluate(program: TranslationUnit): Runtime {
  return {
    agenda: new Agenda(program),
    stash: new Stash(),
    externalDeclarations: [],
    AST: program,
    symTable: [{}],
    memory: {},
    exitCode: undefined,
    currDeclarationSpecifiers: [],
  };
}

export function evaluateNext(rt: Runtime): Runtime {
  if (rt.agenda.isEmpty()) throw new RangeError("agenda is empty");
  const next = rt.agenda.pop();
  if (isInstruction(next)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instructionEvaluator[next.type](rt, next as any);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ASTNodeEvaluator[next.type](rt, next as any);
  }
  return rt;
}

const ASTNodeEvaluator: {
  [NodeType in ASTNode["type"]]: (
    rt: Runtime,
    i: Extract<ASTNode, { type: NodeType }>,
  ) => void;
} = {
  TranslationUnit: (
    rt: Runtime,
    { value: extDeclarations }: TranslationUnit,
  ) => {
    for (const i of extDeclarations.reverse()) {
      rt.agenda.push(i);
    }
  },
  FunctionDefinition: (
    rt: Runtime,
    { specifiers, declarator, body }: FunctionDefinitionAST,
  ) => {
    const identifier = getIdentifierFromDeclarator(declarator);
    const params = getParamsFromFunctionDeclarator(declarator);
    for (const d of rt.externalDeclarations) {
      if (d.identifier == identifier) {
        (d as FunctionDefinition).value = body;
        (d as FunctionDefinition).params = params;
        return;
      }
    }
    const res: FunctionDefinition = {
      declarator,
      specifiers,
      identifier,
      sizeof: 1,
      address: getRandAddress(),
      value: body,
      rawValue: 0,
      isFunction: true,
      params,
    };
    rt.externalDeclarations.push(res);
    rt.symTable[0][identifier] = rt.externalDeclarations.at(
      -1,
    ) as RuntimeObject;
    rt.memory[res.address] = rt.externalDeclarations.at(-1) as RuntimeObject;
  },
  Declaration: (
    rt: Runtime,
    { declaratorList, specifiers }: DeclarationAST,
  ) => {
    rt.currDeclarationSpecifiers = specifiers;
    if (declaratorList.length == 1) {
      return ASTNodeEvaluator["InitDeclarator"](rt, declaratorList[0]);
    }
    for (let i = declaratorList.length - 1; i >= 0; i--) {
      rt.agenda.push(declaratorList[i]);
    }
  },
  InitDeclarator: (
    rt: Runtime,
    { declarator, initializer }: InitDeclarator,
  ) => {
    const identifier = getIdentifierFromDeclarator(declarator);
    const res: RuntimeObject = {
      declarator,
      specifiers: rt.currDeclarationSpecifiers,
      identifier,
      sizeof: 0,
      address: getRandAddress(),
      value: 0,
      rawValue: 0,
      isFunction: false,
    };

    if (isFunctionDeclarator(declarator)) {
      if (initializer) throw new Error("cannot initialize function");
      const params = getParamsFromFunctionDeclarator(declarator);
      rt.externalDeclarations.push({
        ...res,
        sizeof: 1,
        value: undefined,
        isFunction: true,
        params,
      } as FunctionDefinition);
      rt.symTable[0][identifier] = rt.externalDeclarations.at(
        -1,
      ) as FunctionDefinition;
      rt.memory[res.address] = rt.externalDeclarations.at(
        -1,
      ) as FunctionDefinition;
    } else {
      res.sizeof = 8;
      rt.externalDeclarations.push(res);
      rt.symTable[0][identifier] = rt.externalDeclarations.at(
        -1,
      ) as RuntimeObject;
      rt.memory[res.address] = rt.externalDeclarations.at(-1) as RuntimeObject;
      if (initializer) {
        rt.agenda.push(popInstruction());
        rt.agenda.push(assignInstruction(identifier));
        rt.agenda.push(initializer);
      }
    }
  },
  CompoundStatement: (rt: Runtime, { value: stmts }: CompoundStatement) => {
    for (let i = stmts.length - 1; i >= 0; i--) {
      rt.agenda.push(stmts[i]);
    }
  },
  JumpStatementReturn: (rt: Runtime, { value: expr }: JumpStatementReturn) => {
    rt.agenda.push(returnInstruction());
    if (expr) rt.agenda.push(expr);
  },
  EmptyExpressionStatement: () => {},
  CommaOperator: (rt: Runtime, { value: exprs }: CommaOperator) => {
    for (let i = exprs.length - 1; i >= 0; i--) {
      rt.agenda.push(exprs[i]);
    }
  },
  AssignmentExpression: () => {
    throw new Error("not implemented");
  },
  ConditionalExpression: (
    rt: Runtime,
    { cond, exprIfTrue, exprIfFalse }: ConditionalExpressionNode,
  ) => {
    rt.agenda.push(branchInstruction(exprIfTrue, exprIfFalse));
    rt.agenda.push(cond);
  },
  BinaryExpr: (rt: Runtime, { left, op, right }: BinaryExpressionNode) => {
    rt.agenda.push(binaryOpInstruction(op));
    rt.agenda.push(right);
    rt.agenda.push(left);
  },
  UnaryExpressionIncr: () => {
    throw new Error("not implemented");
  },
  UnaryExpressionDecr: () => {
    throw new Error("not implemented");
  },
  UnaryExpression: () => {
    throw new Error("not implemented");
  },
  PostfixExpression: (rt: Runtime, { expr, ops }: PostfixExpressionNode) => {
    for (let i = ops.length - 1; i >= 0; i--) {
      rt.agenda.push(ops[i]);
    }
    rt.agenda.push(expr);
  },
  ArraySubscripting: () => {
    throw new Error("not implemented");
  },
  FunctionCall: (rt: Runtime, { value: args }: FunctionCallOp) => {
    rt.agenda.push(callInstruction(args.length));
    for (let i = args.length - 1; i >= 0; i--) {
      rt.agenda.push(args[i]);
    }
  },
  PointerMember: () => {
    throw new Error("not implemented");
  },
  StructMember: () => {
    throw new Error("not implemented");
  },
  PostfixIncrement: () => {
    throw new Error("not implemented");
  },
  PostfixDecrement: () => {
    throw new Error("not implemented");
  },
  PrimaryExprIdentifier: (
    rt: Runtime,
    { value: identifier }: PrimaryExprIdentifier,
  ) => {
    const d = lookup(rt.symTable, identifier);
    if (isFunction(d)) {
      rt.stash.pushPtr(d.address);
    } else {
      rt.stash.pushValue(d.value);
    }
  },
  PrimaryExprConstant: (rt: Runtime, { value }: PrimaryExprConstant) => {
    rt.stash.pushValue(value);
  },
  PrimaryExprString: () => {
    throw new Error("not implemented");
  },
  PrimaryExprParenthesis: (
    rt: Runtime,
    { value: expr }: PrimaryExprParenthesis,
  ) => {
    rt.agenda.push(expr);
  },
};

const instructionEvaluator: {
  [InstrType in Instruction["type"]]: (
    rt: Runtime,
    i: Extract<Instruction, { type: InstrType }>,
  ) => void;
} = {
  [InstructionType.BINARY_OP]: (rt: Runtime, { op }: BinaryOpInstruction) => {
    const right = rt.stash.pop().value;
    const left = rt.stash.pop().value;
    let res;
    switch (op) {
      case "+":
        // check overflow?
        // unsigned types cannot overflow: 6.2.5.9
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
  [InstructionType.MARK]: () => {
    throw new Error("mark encountered without return");
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
    const fnDecl = rt.memory[fnAddress] as FunctionDefinition;
    rt.agenda.push(markInstruction());
    const compoundStatement = fnDecl.value;
    if (!compoundStatement) throw new Error("function not defined");
    if (compoundStatement.value.length === 1) {
      rt.agenda.push(compoundStatement.value[0]);
    } else {
      rt.agenda.push(compoundStatement);
    }

    const sf: SymbolTable = {};
    for (let i = 0; i < arity; i++) {
      const { declarator, specifiers } = fnDecl.params[i];
      const identifier = getIdentifierFromDeclarator(declarator);
      const d: RuntimeObject = {
        declarator,
        specifiers,
        identifier,
        sizeof: 8,
        address: getRandAddress(),
        value: args[i],
        rawValue: 0,
        isFunction: false,
      };
      sf[identifier] = d;
      rt.memory[d.address] = d;
    }
    rt.symTable.push(sf);
  },
  [InstructionType.RETURN]: (rt: Runtime) => {
    while (!isMarkInstruction(rt.agenda.peek())) rt.agenda.pop();
    rt.agenda.pop();
    rt.symTable.pop();
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
