import {
  TypedUnaryExpressionDecr,
  UnaryExpressionDecr,
  isTypedArraySubscriptingOp,
} from "./../ast/types";
import {
  PrimaryExprParenthesis,
  PrimaryExprString,
  TypedPrimaryExprParenthesis,
  AssignmentExpression,
  BinaryExpression,
  BlockItem,
  CastExpression,
  CommaOperator,
  CompoundStatement,
  ConditionalExpression,
  Declaration,
  DeclarationSpecifiers,
  Expression,
  ExpressionStatement,
  ExternalDeclaration,
  FunctionDefinition,
  InitDeclarator,
  Initializer,
  JumpStatement,
  JumpStatementReturn,
  PostfixExpression,
  PostfixExpressionNode,
  PrimaryExprConstant,
  PrimaryExprIdentifier,
  PrimaryExpression,
  Statement,
  TranslationUnit,
  TypedAssignmentExpression,
  TypedBinaryExpression,
  TypedBlockItem,
  TypedCastExpression,
  TypedCommaOperator,
  TypedCompoundStatement,
  TypedConditionalExpression,
  TypedDeclaration,
  TypedExpression,
  TypedExpressionStatement,
  TypedExternalDeclaration,
  TypedFunctionDefinition,
  TypedInitDeclarator,
  TypedInitializer,
  TypedJumpStatement,
  TypedJumpStatementReturn,
  TypedPostfixExpression,
  TypedPostfixExpressionNode,
  TypedPrimaryExprConstant,
  TypedPrimaryExprIdentifier,
  TypedPrimaryExpression,
  TypedStatement,
  TypedTranslationUnit,
  TypedUnaryExpression,
  TypedUnaryExpressionIncr,
  UnaryExpression,
  UnaryExpressionIncr,
  isAssignmentExpressionNode,
  isBinaryExpressionNode,
  isCommaOperator,
  isCompoundStatement,
  isConditionalExpressionNode,
  isDeclaration,
  isEmptyExpressionStatement,
  isFunctionDefinition,
  isJumpStatement,
  isPostfixExpressionNode,
  isPrimaryExprIdentifier,
  isUnaryExpressionDecr,
  isUnaryExpressionIncr,
  isUnaryExpressionNode,
  isPrimaryExprConstant,
  isPrimaryExprString,
  TypedConstant,
  IntegerConstant,
  TypedIntegerConstant,
  Constant,
  TypedPrimaryExprString,
  ExpressionTypeInfo,
  TypedPostfixOp,
  PostfixOp,
  UnaryExpressionNode,
  isTypedUnaryExpressionNode,
  TypedUnaryExpressionNode,
  isTypedPostfixExpressionNode,
} from "../ast/types";
import { applyImplicitConversions } from "./conversions";
import { TypeEnv } from "./env";
import {
  getNumericalLimitFromSpecifiers,
  getTypeInfoFromSpecifiers,
} from "./specifiers";
import {
  FunctionReturnType,
  TypeInfo,
  array,
  char,
  int,
  isArithmeticType,
  isArray,
  isFunction,
  isIncompleteTypeInfo,
  isIntegerType,
  isObjectTypeInfo,
  isPointer,
  isScalarType,
  isStructure,
  isVoid,
  pointer,
  voidType,
} from "./types";
import {
  checkSimpleAssignmentConstraint,
  constructType,
  getMemberTypeInfo,
  isLvalue,
  isModifiableLvalue,
  isNullPtrConst,
} from "./utils";

export const typeTranslationUnit = (
  t: TranslationUnit,
): TypedTranslationUnit => {
  const res: TypedTranslationUnit = {
    ...t,
    value: [],
  };
  const env = new TypeEnv();
  for (const i of t.value) {
    res.value.push(typeExternalDeclaration(i, env));
  }
  return res;
};

const typeExternalDeclaration = (
  t: ExternalDeclaration,
  env: TypeEnv,
): TypedExternalDeclaration => {
  if (isFunctionDefinition(t)) {
    return typeFunctionDefinition(t, env);
  }
  return typeDeclaration(t, env);
};

const typeFunctionDefinition = (
  t: FunctionDefinition,
  env: TypeEnv,
): TypedFunctionDefinition => {
  const { identifier, type: typeInfo } = constructType(
    t.specifiers,
    t.declarator,
  );

  if (!identifier) throw "function definition must contain an identifier";
  if (!isFunction(typeInfo)) throw "declarator does not have function type";
  env.addIdentifierTypeInfo(identifier, typeInfo);

  env.enterBlock();
  typeInfo.parameterTypes.forEach((i) => {
    if (!i.identifier)
      throw "declaration of parameter in function definition must contain an identifier";
    env.addIdentifierTypeInfo(i.identifier, i.type);
  });
  // to type check return statement
  env.addIdentifierTypeInfo("@returnType", typeInfo.returnType);
  const body = typeCompoundStatement(t.body, env);
  env.exitBlock();

  return { ...t, identifier, typeInfo, body };
};

const typeDeclaration = (t: Declaration, env: TypeEnv): TypedDeclaration => {
  return {
    ...t,
    declaratorList: t.declaratorList.map((i) =>
      typeInitDeclarator(i, env, t.specifiers),
    ),
  };
};

const typeInitDeclarator = (
  t: InitDeclarator,
  env: TypeEnv,
  specifiers: DeclarationSpecifiers,
): TypedInitDeclarator => {
  const { identifier, type: typeInfo } = constructType(
    specifiers,
    t.declarator,
  );
  if (!identifier) {
    throw "declarator must declare one identifier";
  }
  if (t.initializer) {
    if (!isObjectTypeInfo(typeInfo)) throw "cannot initialize non object type";
    // TODO: if we are in file scope, need check that initializer is a constant expression
    // see (6.6) Constant expressions and (6.7.8) Initialization
    // TODO: type check this
  }
  const res = {
    ...t,
    identifier,
    typeInfo,
    initializer: t.initializer ? typeInitializer(t.initializer, env) : null,
  };
  env.addIdentifierTypeInfo(identifier, typeInfo);
  return res;
};

const typeInitializer = (t: Initializer, env: TypeEnv): TypedInitializer =>
  typeAssignmentExpression(t, env);

const typeCompoundStatement = (
  t: CompoundStatement,
  env: TypeEnv,
): TypedCompoundStatement => {
  // env.enterBlock should be called before this function is called
  // env.exitBlock should be called after this function returns
  return { ...t, value: t.value.map((i) => typeBlockItem(i, env)) };
};

const typeBlockItem = (t: BlockItem, env: TypeEnv): TypedBlockItem => {
  if (isDeclaration(t)) return typeDeclaration(t, env);
  return typeStatement(t, env);
};

const typeStatement = (t: Statement, env: TypeEnv): TypedStatement => {
  if (isCompoundStatement(t)) {
    env.enterBlock();
    const res = typeCompoundStatement(t, env);
    env.exitBlock();
    return res;
  }
  if (isJumpStatement(t)) return typeJumpStatement(t, env);
  return typeExpressionStatement(t, env);
};

const typeJumpStatement = (
  t: JumpStatement,
  env: TypeEnv,
): TypedJumpStatement => {
  // if (isJumpStatementReturn(t))
  return typeJumpStatementReturn(t, env);
};

const typeJumpStatementReturn = (
  t: JumpStatementReturn,
  env: TypeEnv,
): TypedJumpStatementReturn => {
  const expectedReturnType = env.getIdentifierTypeInfo(
    "@returnType",
  ) as FunctionReturnType;

  if (isVoid(expectedReturnType)) {
    if (t.value)
      throw "non-empty return statement in function declared with void return type";
    return { ...t, value: null };
  }

  if (!t.value)
    throw "empty return statement in function declared with non-void return type";

  const expr = typeExpression(t.value, env);
  if (!checkSimpleAssignmentConstraint(expectedReturnType, expr))
    throw "wrong return type";

  return { ...t, value: expr };
};

const typeExpressionStatement = (
  t: ExpressionStatement,
  env: TypeEnv,
): TypedExpressionStatement => {
  if (isEmptyExpressionStatement(t)) return t;
  return typeExpression(t, env);
};

const typeExpression = (t: Expression, env: TypeEnv): TypedExpression => {
  if (isCommaOperator(t)) return typeCommaOperator(t, env);
  return typeAssignmentExpression(t, env);
};

const typeCommaOperator = (
  t: CommaOperator,
  env: TypeEnv,
): TypedCommaOperator => {
  const value = t.value.map((i) => typeAssignmentExpression(i, env));
  const last = value[value.length - 1];
  return {
    ...t,
    value,
    typeInfo: last.typeInfo,
    lvalue: false, // not lvalue in C, lvalue iff last is lvalue in C++
  };
};

const typeAssignmentExpression = (
  t: AssignmentExpression,
  env: TypeEnv,
): TypedAssignmentExpression => {
  if (!isAssignmentExpressionNode(t)) return typeConditionalExpression(t, env);

  const left = typeUnaryExpression(t.left, env);
  if (!isModifiableLvalue(left))
    throw "require a modifiable lvalue as left operand in assignment";
  const leftType = left.typeInfo;
  const right = typeAssignmentExpression(t.right, env);
  const rightType = right.typeInfo;

  let ok = false;
  switch (t.op) {
    case "=": {
      if (checkSimpleAssignmentConstraint(leftType, right)) ok = true;
      break;
    }
    case "*=":
    case "/=": {
      if (isArithmeticType(leftType) && isArithmeticType(rightType)) ok = true;
      break;
    }
    case "%=": {
      if (isIntegerType(leftType) && isIntegerType(rightType)) ok = true;
      break;
    }
    case "+=":
    case "-=": {
      if (
        isPointer(leftType) &&
        isObjectTypeInfo(leftType.referencedType) &&
        isIntegerType(rightType)
      )
        ok = true;
      if (isArithmeticType(leftType) && isArithmeticType(rightType)) ok = true;
      break;
    }
    case "<<=":
    case ">>=":
    case "&=":
    case "^=":
    case "|=": {
      if (isIntegerType(leftType) && isIntegerType(rightType)) ok = true;
      break;
    }
  }

  if (!ok)
    throw "invalid assignment expression: left and right operand typing constraint violated";

  return {
    ...t,
    typeInfo: leftType,
    lvalue: false, // not lvalue in C, but lvalue in C++
    left,
    right,
  };
};

const typeConditionalExpression = (
  t: ConditionalExpression,
  env: TypeEnv,
): TypedConditionalExpression => {
  if (!isConditionalExpressionNode(t)) return typeBinaryExpression(t, env);

  const cond = typeBinaryExpression(t.cond, env);
  if (!isScalarType(cond.typeInfo)) throw "condition must be of scalar type";

  const exprIfTrue = typeExpression(t.exprIfTrue, env);
  const exprIfFalse = typeConditionalExpression(t.exprIfFalse, env);
  const t1 = exprIfTrue.typeInfo;
  const t2 = exprIfFalse.typeInfo;

  let resType: TypeInfo | undefined;
  // TODO: arithmetic conversion
  if (isArithmeticType(t1) && isArithmeticType(t2)) resType = t1;
  if (isStructure(t1) && isStructure(t2) && t1.isCompatible(t2)) resType = t1;
  if (isVoid(t1) && isVoid(t2)) resType = voidType();
  if (
    isPointer(t1) &&
    isPointer(t2) &&
    t1.referencedType.isCompatible(t2.referencedType)
  )
    resType = t1;
  if (isPointer(t1) && isNullPtrConst(exprIfFalse)) resType = t1;
  if (isPointer(t2) && isNullPtrConst(exprIfTrue)) resType = t2;
  if (
    isPointer(t1) &&
    (isObjectTypeInfo(t1.referencedType) ||
      isIncompleteTypeInfo(t1.referencedType)) &&
    isPointer(t2) &&
    isVoid(t2.referencedType)
  )
    resType = t1;
  if (
    isPointer(t2) &&
    (isObjectTypeInfo(t2.referencedType) ||
      isIncompleteTypeInfo(t2.referencedType)) &&
    isPointer(t1) &&
    isVoid(t1.referencedType)
  )
    resType = t2;

  if (!resType) throw "invalid operand types in conditional expression";
  return {
    ...t,
    cond,
    exprIfTrue,
    exprIfFalse,
    lvalue: false,
    typeInfo: resType,
  };
};

const typeBinaryExpression = (
  t: BinaryExpression,
  env: TypeEnv,
): TypedBinaryExpression => {
  if (!isBinaryExpressionNode(t)) return typeCastExpression(t, env);

  const left = typeBinaryExpression(t.left, env);
  const right = typeBinaryExpression(t.left, env);
  const t0 = left.typeInfo;
  const t1 = right.typeInfo;
  let typeInfo: TypeInfo;

  switch (t.op) {
    case "||":
    case "&&": {
      if (!(isScalarType(t0) && isScalarType(t1)))
        throw "both operands of && or || should be of scalar type";
      typeInfo = int();
      break;
    }
    case "|":
    case "^":
    case "&": {
      if (!(isIntegerType(t0) && isIntegerType(t1)))
        throw "both operands of |, ^ or & should be of integral type";
      typeInfo = t0; // TODO: usual arithmetic conversions
      break;
    }
    case "==":
    case "!=": {
      let ok = false;
      if (isArithmeticType(t0) && isArithmeticType(t1)) ok = true;
      if (isPointer(t0) && isPointer(t1)) {
        const rt0 = t0.referencedType;
        const rt1 = t1.referencedType;
        if (rt0.isCompatible(rt1)) ok = true;
        if ((isObjectTypeInfo(rt0) || isIncompleteTypeInfo(rt0)) && isVoid(rt1))
          ok = true;
        if ((isObjectTypeInfo(rt1) || isIncompleteTypeInfo(rt1)) && isVoid(rt0))
          ok = true;
      }
      if (isPointer(t0) && isNullPtrConst(right)) ok = true;
      if (isPointer(t1) && isNullPtrConst(left)) ok = true;

      if (!ok) throw "typing constraints for == or != violated";
      typeInfo = int();
      break;
    }
    case "<":
    case ">":
    case "<=":
    case ">=": {
      let ok = false;
      if (isArithmeticType(t0) && isArithmeticType(t1)) ok = true;
      if (isPointer(t0) && isPointer(t1)) {
        const rt0 = t0.referencedType;
        const rt1 = t1.referencedType;
        if (
          isObjectTypeInfo(rt0) &&
          isObjectTypeInfo(rt1) &&
          rt0.isCompatible(rt1)
        )
          ok = true;
        if (
          isIncompleteTypeInfo(rt0) &&
          isIncompleteTypeInfo(rt1) &&
          rt0.isCompatible(rt1)
        )
          ok = true;
      }

      if (!ok) throw "typing constraints for <, >, <= or >= violated";
      typeInfo = int();
      break;
    }
    case "<<":
    case ">>": {
      if (!(isIntegerType(t0) && isIntegerType(t1)))
        throw "both operands of << or >> should be of integral type";
      typeInfo = t0;
      break;
    }
    case "+": {
      let resType: TypeInfo | undefined;
      if (isArithmeticType(t0) && isArithmeticType(t1)) resType = t0;
      if (
        isPointer(t0) &&
        isObjectTypeInfo(t0.referencedType) &&
        isIntegerType(t1)
      )
        resType = t0;
      if (
        isPointer(t1) &&
        isObjectTypeInfo(t1.referencedType) &&
        isIntegerType(t0)
      )
        resType = t1;

      if (!resType) throw "typing constraints for + violated";
      typeInfo = resType;
      break;
    }
    case "-": {
      let resType: TypeInfo | undefined;
      if (isArithmeticType(t0) && isArithmeticType(t1)) resType = t0;
      if (
        isPointer(t0) &&
        isPointer(t1) &&
        t0.referencedType.isCompatible(t1.referencedType)
      )
        resType = t0;
      if (
        isPointer(t0) &&
        isObjectTypeInfo(t0.referencedType) &&
        isIntegerType(t1)
      )
        resType = t0;

      if (!resType) throw "typing constraints for - violated";
      typeInfo = resType;
      break;
    }
    case "*":
    case "/":
    case "%": {
      if (!(isArithmeticType(t0) && isArithmeticType(t1)))
        throw "both operands of *, / or % should be of arithmetic type";
      if (t.op === "%" && !(isIntegerType(t0) && isIntegerType(t1)))
        throw "both operands of % should be of integral type";
      typeInfo = t0;
      break;
    }
    default:
      throw "invalid binary operator";
  }

  return {
    ...t,
    left,
    right,
    typeInfo,
    lvalue: false,
  };
};

const typeCastExpression = (
  t: CastExpression,
  env: TypeEnv,
): TypedCastExpression => typeUnaryExpression(t, env);

const typeUnaryExpression = (
  t: UnaryExpression,
  env: TypeEnv,
): TypedUnaryExpression => {
  if (isUnaryExpressionIncr(t)) return typeUnaryExpressionIncr(t, env);
  if (isUnaryExpressionDecr(t)) return typeUnaryExpressionDecr(t, env);
  if (isUnaryExpressionNode(t)) return typeUnaryExpressionNode(t, env);
  return typePostfixExpression(t, env);
};

const typeUnaryExpressionIncr = (
  t: UnaryExpressionIncr,
  env: TypeEnv,
): TypedUnaryExpressionIncr => {
  const value = typeUnaryExpression(t.value, env);
  if (
    !(
      isModifiableLvalue(value) &&
      (isArithmeticType(value.typeInfo) || isPointer(value.typeInfo))
    )
  )
    throw "prefix increment must be on a modifiable lvalue of arithmetic or pointer type";
  return { ...t, value, typeInfo: value.typeInfo, lvalue: true };
};

const typeUnaryExpressionDecr = (
  t: UnaryExpressionDecr,
  env: TypeEnv,
): TypedUnaryExpressionDecr => {
  const value = typeUnaryExpression(t.value, env);
  if (
    !(
      isModifiableLvalue(value) &&
      (isArithmeticType(value.typeInfo) || isPointer(value.typeInfo))
    )
  )
    throw "prefix decrement must be on a modifiable lvalue of arithmetic or pointer type";
  return { ...t, value, typeInfo: value.typeInfo, lvalue: true };
};

const typeUnaryExpressionNode = (
  t: UnaryExpressionNode,
  env: TypeEnv,
): TypedUnaryExpressionNode => {
  const expr = typeCastExpression(t.expr, env);
  const t0 = expr.typeInfo;
  let exprType: ExpressionTypeInfo;
  switch (t.op) {
    case "!": {
      if (!isScalarType(t0)) throw "operand of ! must be of scalar type";
      exprType = { typeInfo: int(), lvalue: false };
      break;
    }
    case "&": {
      let typeInfo: TypeInfo | undefined;
      if (isFunction(t0)) typeInfo = pointer(t0);
      if (isLvalue(expr)) typeInfo = pointer(t0);
      if (isTypedUnaryExpressionNode(expr) && expr.op === "*")
        typeInfo = expr.expr.typeInfo;
      if (
        isTypedPostfixExpressionNode(expr) &&
        isTypedArraySubscriptingOp(expr.op)
      )
        typeInfo = pointer(expr.typeInfo);

      if (!typeInfo) throw "& operator typing constraints violated";
      exprType = { typeInfo, lvalue: false };
      break;
    }
    case "*": {
      if (!isPointer(t0)) throw "operand of * must be of pointer type";
      const rt = t0.referencedType;
      exprType = { typeInfo: rt, lvalue: isObjectTypeInfo(rt) };
      break;
    }
    case "+":
    case "-": {
      if (!isArithmeticType(t0))
        throw "operand of + or - must be of arithmetic type";
      exprType = { typeInfo: t0, lvalue: false };
      break;
    }
    case "~": {
      if (!isIntegerType(t0)) throw "operand of ~ must be of integeral type";
      exprType = { typeInfo: t0, lvalue: false }; // TODO: integral promotions
      break;
    }
    default:
      throw "invalid unary op";
  }
  return { ...t, expr, ...exprType };
};

const typePostfixExpression = (
  t: PostfixExpression,
  env: TypeEnv,
): TypedPostfixExpression => {
  if (isPostfixExpressionNode(t)) return typePostfixExpressionNode(t, env);
  return typePrimaryExpression(t, env);
};

const typePostfixExpressionNode = (
  t: PostfixExpressionNode,
  env: TypeEnv,
): TypedPostfixExpressionNode => {
  let expr: TypedPostfixExpression;
  let o: PostfixOp;
  if (t.ops.length > 1) {
    o = t.ops.pop() as PostfixOp;
    expr = typePostfixExpressionNode(t, env);
  } else {
    o = t.ops[0];
    expr = typePrimaryExpression(t.expr, env);
  }

  let op: TypedPostfixOp;
  let exprType: ExpressionTypeInfo;
  switch (o.type) {
    case "ArraySubscripting": {
      const value = typeExpression(o.value, env);
      const t1 = value.typeInfo;
      const t2 = expr.typeInfo;
      let typeInfo: TypeInfo | undefined;
      if (
        isPointer(t1) &&
        isObjectTypeInfo(t1.referencedType) &&
        isIntegerType(t2)
      )
        typeInfo = t1.referencedType;
      if (
        isPointer(t2) &&
        isObjectTypeInfo(t2.referencedType) &&
        isIntegerType(t1)
      )
        typeInfo = t2.referencedType;
      if (!typeInfo) throw "array subscripting typing constraints violated";
      op = { ...o, value };
      exprType = { typeInfo, lvalue: true };
      break;
    }
    case "FunctionCall": {
      const t0 = applyImplicitConversions(expr).typeInfo;
      if (!(isPointer(t0) && isFunction(t0.referencedType)))
        throw "expression should have type pointer to function";
      const ft = t0.referencedType;
      const rt = ft.returnType;
      if (!(isVoid(rt) || (isObjectTypeInfo(rt) && !isArray(rt))))
        throw "function should return void or object type other than an array type";

      const value = o.value.map((i) => typeAssignmentExpression(i, env));
      if (value.length !== ft.arity)
        throw "function call has wrong number of arguments";
      ft.parameterTypes.forEach((p, i) => {
        if (!checkSimpleAssignmentConstraint(p.type, value[i]))
          throw "mismatch in argument type";
      });

      op = {
        ...o,
        value,
      };
      exprType = {
        typeInfo: rt,
        lvalue: false,
      };
      break;
    }
    case "PointerMember": {
      if (!isPointer(expr.typeInfo))
        throw "arrow operator on non pointer to struct type";
      const rt = expr.typeInfo.referencedType;
      if (!isStructure(rt))
        throw "arrow operator on non pointer to struct type";
      const typeInfo = getMemberTypeInfo(rt, o.value);
      op = { ...o };
      exprType = { typeInfo, lvalue: true };
      break;
    }
    case "StructMember": {
      if (!isStructure(expr.typeInfo)) throw "dot operator on non struct type";
      const typeInfo = getMemberTypeInfo(expr.typeInfo, o.value);
      op = { ...o };
      exprType = { typeInfo, lvalue: expr.lvalue };
      break;
    }
    case "PostfixDecrement":
    case "PostfixIncrement": {
      if (
        !(
          isModifiableLvalue(expr) &&
          (isArithmeticType(expr.typeInfo) || isPointer(expr.typeInfo))
        )
      )
        throw "postfix increment/decrement must be on a modifiable lvalue of arithmetic or pointer type";
      op = { ...o };
      exprType = { typeInfo: expr.typeInfo, lvalue: false }; // TODO: see integral promotions
      break;
    }
    default:
      throw "invalid postfix op";
  }

  return { ...t, expr, op, ...exprType };
};

const typePrimaryExpression = (
  t: PrimaryExpression,
  env: TypeEnv,
): TypedPrimaryExpression => {
  if (isPrimaryExprIdentifier(t)) return typePrimaryExprIdentifier(t, env);
  if (isPrimaryExprConstant(t)) return typePrimaryExprConstant(t);
  if (isPrimaryExprString(t)) return typePrimaryExprString(t);
  return typePrimaryExprParenthesis(t, env);
};

const typePrimaryExprIdentifier = (
  t: PrimaryExprIdentifier,
  env: TypeEnv,
): TypedPrimaryExprIdentifier => {
  const typeInfo = env.getIdentifierTypeInfo(t.value);
  return {
    ...t,
    typeInfo,
    lvalue: !isFunction(typeInfo),
  };
};

const typePrimaryExprConstant = (
  t: PrimaryExprConstant,
): TypedPrimaryExprConstant => {
  const value = typeConstant(t.value);
  return { ...t, value, typeInfo: value.typeInfo, lvalue: value.lvalue };
};

const typePrimaryExprString = (
  t: PrimaryExprString,
): TypedPrimaryExprString => ({
  ...t,
  typeInfo: array(char(), t.value.length),
  lvalue: true,
});

const typePrimaryExprParenthesis = (
  t: PrimaryExprParenthesis,
  env: TypeEnv,
): TypedPrimaryExprParenthesis => {
  const value = typeExpression(t.value, env);
  return {
    ...t,
    value,
    typeInfo: value.typeInfo,
    lvalue: value.lvalue,
  };
};

const typeConstant = (t: Constant): TypedConstant => typeIntegerConstant(t);

const typeIntegerConstant = (t: IntegerConstant): TypedIntegerConstant => {
  let suffixMask = 0;
  if (t.suffix.unsigned) suffixMask |= 1 << 0;
  if (t.suffix.long) suffixMask |= 1 << 1;
  if (t.suffix.longLong) suffixMask |= 1 << 2;

  let typesToTry = [];
  switch (suffixMask) {
    case 0: {
      // no suffix
      if (t.isDecimal) typesToTry = ["int", "long int", "long long int"];
      else
        typesToTry = [
          "int",
          "unsigned int",
          "long int",
          "unsigned long int",
          "long long int",
          "unsigned long long int",
        ];
      break;
    }
    case 1: {
      // only unsigned
      if (t.isDecimal)
        typesToTry = [
          "unsigned int",
          "unsigned long int",
          "unsigned long long int",
        ];
      else
        typesToTry = [
          "unsigned int",
          "unsigned long int",
          "unsigned long long int",
        ];
      break;
    }
    case 2: {
      // only long
      if (t.isDecimal) typesToTry = ["long int", "long long int"];
      else
        typesToTry = [
          "long int",
          "unsigned long int",
          "long long int",
          "unsigned long long int",
        ];
      break;
    }
    case 3: {
      // only unsigned and long
      if (t.isDecimal)
        typesToTry = ["unsigned long int", "unsigned long long int"];
      else typesToTry = ["unsigned long int", "unsigned long long int"];
      break;
    }
    case 4: {
      // only long long
      if (t.isDecimal) typesToTry = ["long long int"];
      else typesToTry = ["long long int", "unsigned long long int"];
      break;
    }
    case 5: {
      // only unsigned and long long
      if (t.isDecimal) typesToTry = ["unsigned long long int"];
      else typesToTry = ["unsigned long long int"];
      break;
    }
    default:
      throw "invalid integer constant suffix";
  }

  let typeInfo: TypeInfo | undefined;
  for (const ti of typesToTry) {
    const [type_min, type_max] = getNumericalLimitFromSpecifiers(ti);
    if (type_min <= t.value && t.value <= type_max) {
      typeInfo = getTypeInfoFromSpecifiers(
        ti.split(" ") as DeclarationSpecifiers,
      );
      break;
    }
  }

  if (!typeInfo)
    throw (
      "integer constant " +
      t.value +
      " outside numerical limits of all candidate types " +
      JSON.stringify(typesToTry)
    );

  return {
    ...t,
    typeInfo,
    lvalue: false,
  };
};
