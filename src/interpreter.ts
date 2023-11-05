import { Stack } from "./utils";
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

// const isASTNode = (i: AgendaItem): i is ASTNode => {
//   return (i as ASTNode).src !== undefined;
// };

enum InstructionType {
  BINARY_OP = "BinaryOperation",
}

interface BaseInstruction {
  type: InstructionType;
  node: ASTNode;
}

type BinaryOperator = "+" | "-" | "*" | "/" | "%";

interface BinaryOpInstruction extends BaseInstruction {
  op: BinaryOperator;
}

const binaryOpInstruction = (
  op: BinaryOperator,
  node: ASTNode,
): BinaryOpInstruction => ({
  type: InstructionType.BINARY_OP,
  op,
  node,
});

type Instruction = BinaryOpInstruction;

type AgendaItem = ASTNode | Instruction;

class Agenda extends Stack<AgendaItem> {
  constructor(program: ASTNode) {
    super();
    this.push(program);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Stash extends Stack<any> {}

export interface Runtime {
  agenda: Agenda;
  stash: Stash;
}

export function evaluate(program: ASTNode): Runtime {
  return {
    agenda: new Agenda(program),
    stash: new Stash(),
  };
}

export function evaluateNext(rt: Runtime): Runtime {
  if (rt.agenda.isEmpty()) throw new RangeError("agenda is empty");
  const i = rt.agenda.pop();
  const type = i.type in ASTNodeTypeAlias ? ASTNodeTypeAlias[i.type] : i.type;
  agendaItemEvaluator[type](rt, i);
  return rt;
}

const ASTNodeTypeAlias: { [type: string]: string } = {
  DecimalConstant: "Constant",
  DecimalFloatConstant: "Constant",
};

const agendaItemEvaluator: {
  [type: string]: (rt: Runtime, i: AgendaItem) => void;
} = {
  BinaryExpression: (rt: Runtime, i: ASTNode) => {
    rt.agenda.push(binaryOpInstruction(i.op, i));
    rt.agenda.push(has(i.right, "expression") ? i.right.expression : i.right);
    rt.agenda.push(has(i.left, "expression") ? i.left.expression : i.left);
  },
  Constant: (rt: Runtime, i: ASTNode) => {
    rt.stash.push(i.value);
  },
  [InstructionType.BINARY_OP]: (rt: Runtime, i: BinaryOpInstruction) => {
    const right = rt.stash.pop();
    const left = rt.stash.pop();
    let res;
    switch (i.op) {
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
};
