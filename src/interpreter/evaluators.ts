import {
  ScalarType,
  int,
  isArithmeticType,
  isIntegerType,
  isPointer,
  isScalarType,
  isSigned,
  shortInt,
} from "./../typing/types";
import {
  TypedCompoundStatement,
  TypedDeclaration as TypedDeclarationAST,
  TypedBinaryExpressionNode,
  TypedPrimaryExprConstant,
  TypedPostfixExpressionNode,
  TypedPrimaryExprParenthesis,
  TypedFunctionCallOp,
  TypedJumpStatementReturn,
  TypedConditionalExpressionNode,
  TypedFunctionDefinition as TypedFunctionDefinitionAST,
  TypedCommaOperator,
  TypedTranslationUnit,
  TypedASTNode,
  TypedInitDeclarator,
  TypedUnaryExpressionNode,
  TypedPrimaryExprIdentifier,
} from "../ast/types";
import {
  ArithmeticConversionInstruction,
  AssignInstruction,
  BinaryOpInstruction,
  BranchInstruction,
  CallInstruction,
  Instruction,
  InstructionType,
  UnaryOpInstruction,
  arithmeticConversionInstruction,
  assignInstruction,
  binaryOpInstruction,
  branchInstruction,
  callInstruction,
  isMarkInstruction,
  markInstruction,
  popInstruction,
  returnInstruction,
  unaryOpInstruction,
} from "./instructions";
import { Type, isFunction } from "../typing/types";
import { Runtime } from "./runtime";
import { FunctionDesignator, RuntimeObject, TemporaryObject } from "./object";
import { SHRT_SIZE } from "../constants";
import { BIGINT_TO_BYTES, bytesToBigint } from "../typing/representation";
import { isTemporaryObject } from "./stash";
import { applyUsualArithmeticConversions } from "../typing/conversions";
import { Endianness } from "../config";
import { RuntimeStack } from "./stack";

export const ASTNodeEvaluator: {
  [NodeType in TypedASTNode["type"]]: (
    rt: Runtime,
    i: Extract<TypedASTNode, { type: NodeType }>,
  ) => void;
} = {
  TranslationUnit: (
    rt: Runtime,
    { value: extDeclarations }: TypedTranslationUnit,
  ) => {
    for (const i of extDeclarations.reverse()) {
      rt.agenda.push(i);
    }
  },
  FunctionDefinition: (
    rt: Runtime,
    { identifier, typeInfo, body }: TypedFunctionDefinitionAST,
  ) => {
    const address = rt.allocateText(SHRT_SIZE);
    const idx = rt.addFunction(body);
    rt.memory.setScalar(
      address,
      BigInt(idx),
      Type.ShortInt,
      rt.config.endianness,
    );
    const fd = new FunctionDesignator(typeInfo, address, identifier);
    rt.textAndData.push(fd);
    rt.symbolTable.addAddress(identifier, address);
  },
  Declaration: (rt: Runtime, { declaratorList }: TypedDeclarationAST) => {
    if (declaratorList.length == 1) {
      return ASTNodeEvaluator["InitDeclarator"](rt, declaratorList[0]);
    }
    for (let i = declaratorList.length - 1; i >= 0; i--) {
      rt.agenda.push(declaratorList[i]);
    }
  },
  InitDeclarator: (
    rt: Runtime,
    { identifier, typeInfo, initializer }: TypedInitDeclarator,
  ) => {
    if (rt.symbolTable.inFileScope) {
      throw new Error("declarations in functions not implemented");
    }

    const address = rt.allocateAndZeroData(typeInfo.size);
    const o = new RuntimeObject(typeInfo, address, identifier, rt.memory);
    rt.textAndData.push(o);
    rt.symbolTable.addAddress(identifier, address);

    if (initializer) {
      rt.agenda.push(popInstruction());
      rt.agenda.push(assignInstruction(identifier, typeInfo));
      rt.agenda.push(initializer);
    }
  },
  CompoundStatement: (
    rt: Runtime,
    { value: stmts }: TypedCompoundStatement,
  ) => {
    for (let i = stmts.length - 1; i >= 0; i--) {
      rt.agenda.push(stmts[i]);
    }
  },
  JumpStatementReturn: (
    rt: Runtime,
    { value: expr }: TypedJumpStatementReturn,
  ) => {
    // TODO: conversion as if by assignment
    rt.agenda.push(returnInstruction());
    if (expr) rt.agenda.push(expr);
  },
  EmptyExpressionStatement: () => {},
  CommaOperator: (rt: Runtime, { value: exprs }: TypedCommaOperator) => {
    for (let i = exprs.length - 1; i >= 0; i--) {
      rt.agenda.push(exprs[i]);
    }
  },
  AssignmentExpression: () => {
    throw new Error("not implemented");
  },
  ConditionalExpression: (
    rt: Runtime,
    { cond, exprIfTrue, exprIfFalse, typeInfo }: TypedConditionalExpressionNode,
  ) => {
    if (isArithmeticType(typeInfo))
      rt.agenda.push(arithmeticConversionInstruction(typeInfo));
    rt.agenda.push(branchInstruction(exprIfTrue, exprIfFalse));
    rt.agenda.push(cond);
  },
  BinaryExpr: (rt: Runtime, { left, op, right }: TypedBinaryExpressionNode) => {
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
  UnaryExpression: (rt: Runtime, { expr, op }: TypedUnaryExpressionNode) => {
    switch (op) {
      case "-": {
        rt.agenda.push(unaryOpInstruction(op));
        rt.agenda.push(expr);
        break;
      }
      default:
        throw new Error("not implemented");
    }
  },
  PostfixExpression: (
    rt: Runtime,
    { expr, op }: TypedPostfixExpressionNode,
  ) => {
    rt.agenda.push(op);
    rt.agenda.push(expr);
  },
  ArraySubscripting: () => {
    throw new Error("not implemented");
  },
  FunctionCall: (rt: Runtime, { value: args }: TypedFunctionCallOp) => {
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
    { value: identifier, typeInfo }: TypedPrimaryExprIdentifier,
  ) => {
    if (isFunction(typeInfo)) {
      for (const i of rt.textAndData) {
        if (i.identifier === identifier) {
          rt.stash.push(i as FunctionDesignator);
          return;
        }
      }
      throw "function " + identifier + " not found";
    }
    const address = rt.symbolTable.getAddress(identifier);
    const bytes = rt.memory.getBytes(address, typeInfo.size);
    const t = new TemporaryObject(typeInfo, bytes);
    rt.stash.push(t);
  },
  PrimaryExprConstant: (
    rt: Runtime,
    { value: integerConstant }: TypedPrimaryExprConstant,
  ) => {
    const { typeInfo, value } = integerConstant;
    const bytes = BIGINT_TO_BYTES[typeInfo.type](value, rt.config.endianness);
    const t = new TemporaryObject(typeInfo, bytes);
    rt.stash.push(t);
  },
  PrimaryExprString: () => {
    throw new Error("not implemented");
  },
  PrimaryExprParenthesis: (
    rt: Runtime,
    { value: expr }: TypedPrimaryExprParenthesis,
  ) => {
    rt.agenda.push(expr);
  },
};

export const instructionEvaluator: {
  [InstrType in Instruction["type"]]: (
    rt: Runtime,
    i: Extract<Instruction, { type: InstrType }>,
  ) => void;
} = {
  [InstructionType.UNARY_OP]: (rt: Runtime, { op }: UnaryOpInstruction) => {
    const v = rt.stash.pop();
    switch (op) {
      case "-": {
        if (!(isTemporaryObject(v) && isIntegerType(v.typeInfo)))
          throw new Error("operand of - should be an integer value");
        let n = bytesToBigint(
          v.bytes,
          isSigned(v.typeInfo),
          rt.config.endianness,
        );
        n = -n;
        rt.stash.push(
          new TemporaryObject(
            v.typeInfo,
            BIGINT_TO_BYTES[v.typeInfo.type](n, rt.config.endianness),
          ),
        );
        break;
      }
    }
    throw new Error("not implemented");
  },
  [InstructionType.BINARY_OP]: (rt: Runtime, { op }: BinaryOpInstruction) => {
    const ro = rt.stash.pop();
    const lo = rt.stash.pop();
    if (!(isTemporaryObject(ro) && isTemporaryObject(lo)))
      throw new Error("expected objects for binary operation");
    const t1 = ro.typeInfo;
    const t0 = lo.typeInfo;

    switch (op) {
      case "+": {
        let res: TemporaryObject | undefined = undefined;

        if (isArithmeticType(t0) && isArithmeticType(t1)) {
          let l = bytesToBigint(lo.bytes, isSigned(t0), rt.config.endianness);
          let r = bytesToBigint(ro.bytes, isSigned(t1), rt.config.endianness);
          const ct = applyUsualArithmeticConversions(t0, t1);
          l = convertValue(l, ct, rt.config.endianness);
          r = convertValue(r, ct, rt.config.endianness);
          res = new TemporaryObject(
            ct,
            BIGINT_TO_BYTES[ct.type](l + r, rt.config.endianness),
          );
        }

        if (res === undefined) throw new Error("invalid types for +");
        rt.stash.push(res);
        return;
      }
      case "-":
        // apply usual arithmetic conversions
        break;
      case "*":
      case "/":
      case "%": {
        if (!(isArithmeticType(t0) && isArithmeticType(t1)))
          throw new Error("expected arithmetic types for *, / or %");
        let l = bytesToBigint(lo.bytes, isSigned(t0), rt.config.endianness);
        let r = bytesToBigint(ro.bytes, isSigned(t1), rt.config.endianness);
        const ct = applyUsualArithmeticConversions(t0, t1);
        l = convertValue(l, ct, rt.config.endianness);
        r = convertValue(r, ct, rt.config.endianness);
        let res: bigint;
        switch (op) {
          case "*": {
            res = l * r;
            break;
          }
          case "/": {
            res = l / r;
            break;
          }
          case "%": {
            res = l % r;
            break;
          }
        }
        const bytes = BIGINT_TO_BYTES[ct.type](res, rt.config.endianness);
        const t = new TemporaryObject(ct, bytes);
        rt.stash.push(t);
        return;
      }
      case "==":
      case "!=": {
        // apply usual arithmetic conversions before comparing
        break;
      }
      case "<":
      case ">":
      case "<=":
      case ">=": {
        let isTruthy: boolean | undefined = undefined;

        if (isArithmeticType(t0) && isArithmeticType(t1)) {
          let l = bytesToBigint(lo.bytes, isSigned(t0), rt.config.endianness);
          let r = bytesToBigint(ro.bytes, isSigned(t1), rt.config.endianness);
          const ct = applyUsualArithmeticConversions(t0, t1);
          l = convertValue(l, ct, rt.config.endianness);
          r = convertValue(r, ct, rt.config.endianness);
          switch (op) {
            case "<": {
              isTruthy = l < r;
              break;
            }
            case ">": {
              isTruthy = l > r;
              break;
            }
            case "<=": {
              isTruthy = l <= r;
              break;
            }
            case ">=": {
              isTruthy = l >= r;
              break;
            }
          }
        }

        if (isTruthy === undefined)
          throw new Error("invalid types for >, <, <= or >=");
        const res = BIGINT_TO_BYTES[Type.Int](
          isTruthy ? BigInt(1) : BigInt(0),
          rt.config.endianness,
        );
        const t = new TemporaryObject(int(), res);
        rt.stash.push(t);
        return;
      }
      case "^":
      case "&":
      case "|": {
        // apply usual arithmetic conversions
        break;
      }
    }
    throw new Error("unknown binary operator");
  },
  [InstructionType.POP]: (rt: Runtime) => {
    rt.stash.pop();
  },
  [InstructionType.ASSIGN]: (
    rt: Runtime,
    { identifier, typeInfo }: AssignInstruction,
  ) => {
    const address = rt.symbolTable.getAddress(identifier);
    const o = rt.stash.pop();
    if (!isTemporaryObject(o)) throw new Error("expected object for assign");
    if (isArithmeticType(typeInfo) && isArithmeticType(o.typeInfo)) {
      const n = bytesToBigint(
        o.bytes,
        isSigned(o.typeInfo),
        rt.config.endianness,
      );
      rt.memory.setBytes(
        address,
        BIGINT_TO_BYTES[typeInfo.type](n, rt.config.endianness),
      );
      return;
    }
    // TODO: implement for other types
    throw new Error("unexpected types for assign");
  },
  [InstructionType.MARK]: () => {
    throw new Error("mark encountered without return");
  },
  [InstructionType.EXIT]: (rt: Runtime) => {
    const o = rt.stash.pop();
    if (!(isTemporaryObject(o) && isIntegerType(o.typeInfo)))
      throw new Error("exit code should be integer type");
    const n = bytesToBigint(
      o.bytes,
      isSigned(o.typeInfo),
      rt.config.endianness,
    );
    rt.setExitCode(Number(n));
  },
  [InstructionType.CALL]: (rt: Runtime, { arity }: CallInstruction) => {
    const args = [];
    for (let i = 0; i < arity; i++) {
      args.push(rt.stash.pop());
    }
    args.reverse();

    const o = rt.stash.pop();
    if (
      !(
        isTemporaryObject(o) &&
        isPointer(o.typeInfo) &&
        isFunction(o.typeInfo.referencedType)
      )
    )
      throw new Error("expected ptr to function");

    const fnAddr = bytesToBigint(
      o.bytes,
      isSigned(o.typeInfo),
      rt.config.endianness,
    );
    const fnIdxBytes = rt.memory.getBytes(
      Number(fnAddr),
      o.typeInfo.size,
      true,
    );
    const fnIdx = bytesToBigint(
      fnIdxBytes,
      isSigned(shortInt()),
      rt.config.endianness,
    );
    const fnBody = rt.getFunction(Number(fnIdx));

    rt.agenda.push(markInstruction());
    if (fnBody.value.length === 1) rt.agenda.push(fnBody.value[0]);
    else rt.agenda.push(fnBody);

    const fnType = o.typeInfo.referencedType;
    const frame = RuntimeStack.calculateStackFrame(
      fnType.parameterTypes,
      fnBody,
    );

    rt.stack.push(frame);
    rt.symbolTable.enterBlock();

    for (let i = 0; i < arity; i++) {
      const { identifier, type: typeInfo } = fnType.parameterTypes[i];
      if (!identifier) throw new Error("parameter missing identifier");

      const address = rt.stack.rbp + frame[identifier].address;
      rt.symbolTable.addAddress(identifier, address);

      const o = args[i];
      if (
        !(
          isTemporaryObject(o) &&
          isArithmeticType(o.typeInfo) &&
          isArithmeticType(typeInfo)
        )
      )
        throw new Error("not implemented");
      const n = bytesToBigint(
        o.bytes,
        isSigned(o.typeInfo),
        rt.config.endianness,
      );
      rt.memory.setBytes(
        address,
        BIGINT_TO_BYTES[typeInfo.type](n, rt.config.endianness),
      );
    }
  },
  [InstructionType.RETURN]: (rt: Runtime) => {
    while (!isMarkInstruction(rt.agenda.peek())) rt.agenda.pop();
    rt.agenda.pop();
    rt.symbolTable.exitBlock();
    rt.stack.pop();
  },
  [InstructionType.BRANCH]: (
    rt: Runtime,
    { exprIfTrue, exprIfFalse }: BranchInstruction,
  ) => {
    const o = rt.stash.pop();
    if (!(isTemporaryObject(o) && isScalarType(o.typeInfo)))
      throw new Error("condition should be of scalar type");
    const n = bytesToBigint(
      o.bytes,
      isSigned(o.typeInfo),
      rt.config.endianness,
    );
    if (n === BigInt(0)) {
      rt.agenda.push(exprIfFalse);
    } else {
      rt.agenda.push(exprIfTrue);
    }
  },
  [InstructionType.ARITHMETIC_CONVERSION]: (
    rt: Runtime,
    { typeInfo }: ArithmeticConversionInstruction,
  ) => {
    const o = rt.stash.pop();
    if (!(isTemporaryObject(o) && isArithmeticType(o.typeInfo)))
      throw "expected object of arithmetic type for conversion";
    const n = bytesToBigint(
      o.bytes,
      isSigned(o.typeInfo),
      rt.config.endianness,
    );
    const res = BIGINT_TO_BYTES[typeInfo.type](n, rt.config.endianness);
    const t = new TemporaryObject(typeInfo, res);
    rt.stash.push(t);
  },
};

const convertValue = (
  i: bigint,
  t: ScalarType,
  e: Endianness = "little",
): bigint => {
  const bytes = BIGINT_TO_BYTES[t.type](i, e);
  return bytesToBigint(bytes, isSigned(t), e);
};
