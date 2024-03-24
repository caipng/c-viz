import { FunctionType, TypeInfo } from "../typing/types";

export interface PositionInfo {
  offset: number;
  line: number;
  column: number;
}

export interface BaseNode {
  type: string;
  start: PositionInfo;
  end: PositionInfo;
  src: string;
}

export type ASTNode =
  | TranslationUnit
  | FunctionDefinition
  | Declaration
  | InitDeclarator
  | CompoundStatement
  | JumpStatementReturn
  | EmptyExpressionStatement
  | CommaOperator
  | AssignmentExpressionNode
  | ConditionalExpressionNode
  | BinaryExpressionNode
  | UnaryExpressionIncr
  | UnaryExpressionDecr
  | UnaryExpressionNode
  | PostfixExpressionNode
  | ArraySubscriptingOp
  | FunctionCallOp
  | PointerMemberOp
  | StructMemberOp
  | PostfixIncrementOp
  | PostfixDecrementOp
  | PrimaryExprIdentifier
  | PrimaryExprConstant
  | PrimaryExprString
  | PrimaryExprParenthesis;

export interface TranslationUnit extends BaseNode {
  type: "TranslationUnit";
  value: ExternalDeclaration[];
}

export interface TypedTranslationUnit extends BaseNode {
  type: "TranslationUnit";
  value: TypedExternalDeclaration[];
}

export type ExternalDeclaration = FunctionDefinition | Declaration;

export type TypedExternalDeclaration =
  | TypedFunctionDefinition
  | TypedDeclaration;

export interface FunctionDefinition extends BaseNode {
  type: "FunctionDefinition";
  specifiers: DeclarationSpecifiers;
  declarator: Declarator;
  body: CompoundStatement;
}

export const isFunctionDefinition = (i: BaseNode): i is FunctionDefinition =>
  i.type === "FunctionDefinition";

export interface TypedFunctionDefinition extends BaseNode {
  type: "FunctionDefinition";
  identifier: Identifier;
  typeInfo: FunctionType;
  body: TypedCompoundStatement;
}

export interface Declaration extends BaseNode {
  type: "Declaration";
  specifiers: DeclarationSpecifiers;
  declaratorList: InitDeclarator[];
}

export const isDeclaration = (i: BaseNode): i is Declaration =>
  i.type === "Declaration";

export interface TypedDeclaration extends BaseNode {
  type: "Declaration";
  declaratorList: TypedInitDeclarator[];
}

export type DeclarationSpecifiers = TypeSpecifier[];

export type TypeSpecifier =
  | "void"
  | "char"
  | "short"
  | "int"
  | "long"
  | "float"
  | "double"
  | "signed"
  | "unsigned"
  | "_Bool";

export interface InitDeclarator extends BaseNode {
  type: "InitDeclarator";
  declarator: Declarator;
  initializer: Initializer | null;
}

export interface TypedInitDeclarator extends BaseNode {
  type: "InitDeclarator";
  identifier: Identifier;
  typeInfo: TypeInfo;
  initializer: TypedInitializer | null;
}

export type Initializer = AssignmentExpression;

export type TypedInitializer = TypedAssignmentExpression;

export type Declarator = DeclaratorPart[];

export type DeclaratorPart =
  | IdentifierDeclaratorPart
  | ArrayDeclaratorPart
  | FunctionDeclaratorPart
  | PtrDeclaratorPart;

export type BaseDeclaratorPart = {
  partType: string;
} & (
  | IdentifierDeclaratorPart
  | ArrayDeclaratorPart
  | FunctionDeclaratorPart
  | PtrDeclaratorPart
);

export interface IdentifierDeclaratorPart {
  partType: "identifier";
  name: Identifier;
}

export const isIdentifierDeclaratorPart = (
  i: DeclaratorPart,
): i is IdentifierDeclaratorPart => i.partType === "identifier";

export interface ArrayDeclaratorPart {
  partType: "array";
  length: number;
}

export const isArrayDeclaratorPart = (
  i: DeclaratorPart,
): i is ArrayDeclaratorPart => i.partType === "array";

export interface FunctionDeclaratorPart {
  partType: "function";
  argTypes: ParameterDeclaration[];
}

export const isFunctionDeclaratorPart = (
  i: DeclaratorPart,
): i is FunctionDeclaratorPart => i.partType === "function";

export interface PtrDeclaratorPart {
  partType: "ptr";
}

export const isPtrDeclaratorPart = (
  i: DeclaratorPart,
): i is PtrDeclaratorPart => i.partType === "ptr";

export interface ParameterDeclaration {
  specifiers: DeclarationSpecifiers;
  declarator: Declarator | AbstractDeclarator;
}

export type AbstractDeclarator = AbstractDeclaratorPart[];

export type AbstractDeclaratorPart =
  | ArrayDeclaratorPart
  | FunctionDeclaratorPart
  | PtrDeclaratorPart;

export interface CompoundStatement extends BaseNode {
  type: "CompoundStatement";
  value: BlockItem[];
}

export const isCompoundStatement = (i: BaseNode): i is CompoundStatement =>
  i.type === "CompoundStatement";

export interface TypedCompoundStatement extends BaseNode {
  type: "CompoundStatement";
  value: TypedBlockItem[];
}

export type BlockItem = Statement | Declaration;

export type TypedBlockItem = TypedStatement | TypedDeclaration;

export type Statement = CompoundStatement | ExpressionStatement | JumpStatement;

export type TypedStatement =
  | TypedCompoundStatement
  | TypedExpressionStatement
  | TypedJumpStatement;

export type JumpStatement = JumpStatementReturn;

export const isJumpStatement = (i: BaseNode): i is JumpStatement =>
  isJumpStatementReturn(i);

export type TypedJumpStatement = TypedJumpStatementReturn;

export interface JumpStatementReturn extends BaseNode {
  type: "JumpStatementReturn";
  value: Expression | null;
}

export const isJumpStatementReturn = (i: BaseNode): i is JumpStatementReturn =>
  i.type === "JumpStatementReturn";

export interface TypedJumpStatementReturn extends BaseNode {
  type: "JumpStatementReturn";
  value: TypedExpression | null;
}

export type ExpressionStatement = Expression | EmptyExpressionStatement;

export type TypedExpressionStatement =
  | TypedExpression
  | EmptyExpressionStatement;

export interface EmptyExpressionStatement extends BaseNode {
  type: "EmptyExpressionStatement";
}

export const isEmptyExpressionStatement = (
  i: BaseNode,
): i is EmptyExpressionStatement => i.type === "EmptyExpressionStatement";

export type Expression = AssignmentExpression | CommaOperator;

export type TypedExpression = TypedExpressionBaseNode &
  (TypedAssignmentExpression | TypedCommaOperator);

export interface ExpressionTypeInfo {
  typeInfo: TypeInfo;
  lvalue: boolean;
}

export interface TypedExpressionBaseNode extends BaseNode, ExpressionTypeInfo {}

export interface CommaOperator extends BaseNode {
  type: "CommaOperator";
  value: AssignmentExpression[];
}

export const isCommaOperator = (i: BaseNode): i is CommaOperator =>
  i.type === "CommaOperator";

export interface TypedCommaOperator extends TypedExpressionBaseNode {
  type: "CommaOperator";
  value: TypedAssignmentExpression[];
}

export type AssignmentExpression =
  | ConditionalExpression
  | AssignmentExpressionNode;

export type TypedAssignmentExpression =
  | TypedConditionalExpression
  | TypedAssignmentExpressionNode;

export interface AssignmentExpressionNode extends BaseNode {
  type: "AssignmentExpression";
  op: AssignmentOperator;
  left: UnaryExpression;
  right: AssignmentExpression;
}

export const isAssignmentExpressionNode = (
  i: BaseNode,
): i is AssignmentExpressionNode => i.type === "AssignmentExpression";

export interface TypedAssignmentExpressionNode extends TypedExpressionBaseNode {
  type: "AssignmentExpression";
  op: AssignmentOperator;
  left: TypedUnaryExpression;
  right: TypedAssignmentExpression;
}

export type AssignmentOperator =
  | "="
  | "*="
  | "/="
  | "%="
  | "+="
  | "-="
  | "<<="
  | ">>="
  | "&="
  | "^="
  | "|=";

export type ConditionalExpression =
  | BinaryExpression
  | ConditionalExpressionNode;

export type TypedConditionalExpression =
  | TypedBinaryExpression
  | TypedConditionalExpressionNode;

export interface ConditionalExpressionNode extends BaseNode {
  type: "ConditionalExpression";
  cond: BinaryExpression;
  exprIfTrue: Expression;
  exprIfFalse: ConditionalExpression;
}

export const isConditionalExpressionNode = (
  i: BaseNode,
): i is ConditionalExpressionNode => i.type === "ConditionalExpression";

export interface TypedConditionalExpressionNode
  extends TypedExpressionBaseNode {
  type: "ConditionalExpression";
  cond: TypedBinaryExpression;
  exprIfTrue: TypedExpression;
  exprIfFalse: TypedConditionalExpression;
}

export type BinaryExpression = CastExpression | BinaryExpressionNode;

export type TypedBinaryExpression =
  | TypedCastExpression
  | TypedBinaryExpressionNode;

export interface BinaryExpressionNode extends BaseNode {
  type: "BinaryExpr";
  op: BinaryOperator;
  left: BinaryExpression;
  right: BinaryExpression;
}

export const isBinaryExpressionNode = (
  i: BaseNode,
): i is BinaryExpressionNode => i.type === "BinaryExpr";

export interface TypedBinaryExpressionNode extends TypedExpressionBaseNode {
  type: "BinaryExpr";
  op: BinaryOperator;
  left: TypedBinaryExpression;
  right: TypedBinaryExpression;
}

export type BinaryOperator =
  | "||"
  | "&&"
  | "|"
  | "^"
  | "&"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "<<"
  | ">>"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%";

export type CastExpression = UnaryExpression;

export type TypedCastExpression = TypedUnaryExpression;

export type UnaryExpression =
  | PostfixExpression
  | UnaryExpressionIncr
  | UnaryExpressionDecr
  | UnaryExpressionNode;

export type TypedUnaryExpression =
  | TypedPostfixExpression
  | TypedUnaryExpressionIncr
  | TypedUnaryExpressionDecr
  | TypedUnaryExpressionNode;

export interface UnaryExpressionIncr extends BaseNode {
  type: "UnaryExpressionIncr";
  value: UnaryExpression;
}

export const isUnaryExpressionIncr = (i: BaseNode): i is UnaryExpressionIncr =>
  i.type === "UnaryExpressionIncr";

export interface TypedUnaryExpressionIncr extends TypedExpressionBaseNode {
  type: "UnaryExpressionIncr";
  value: TypedUnaryExpression;
}

export interface UnaryExpressionDecr extends BaseNode {
  type: "UnaryExpressionDecr";
  value: UnaryExpression;
}

export const isUnaryExpressionDecr = (i: BaseNode): i is UnaryExpressionDecr =>
  i.type === "UnaryExpressionDecr";

export interface TypedUnaryExpressionDecr extends TypedExpressionBaseNode {
  type: "UnaryExpressionDecr";
  value: TypedUnaryExpression;
}

export interface UnaryExpressionNode extends BaseNode {
  type: "UnaryExpression";
  op: UnaryOperator;
  expr: CastExpression;
}

export const isUnaryExpressionNode = (i: BaseNode): i is UnaryExpressionNode =>
  i.type === "UnaryExpression";

export interface TypedUnaryExpressionNode extends TypedExpressionBaseNode {
  type: "UnaryExpression";
  op: UnaryOperator;
  expr: TypedCastExpression;
}

export const isTypedUnaryExpressionNode = (
  i: TypedExpression,
): i is TypedUnaryExpressionNode => i.type === "UnaryExpression";

export type UnaryOperator = "&" | "*" | "+" | "-" | "~" | "!";

export type PostfixExpression = PrimaryExpression | PostfixExpressionNode;

export type TypedPostfixExpression =
  | TypedPrimaryExpression
  | TypedPostfixExpressionNode;

export interface PostfixExpressionNode extends BaseNode {
  type: "PostfixExpression";
  expr: PrimaryExpression;
  ops: PostfixOp[];
}

export const isPostfixExpressionNode = (
  i: BaseNode,
): i is PostfixExpressionNode => i.type === "PostfixExpression";

export interface TypedPostfixExpressionNode extends TypedExpressionBaseNode {
  type: "PostfixExpression";
  expr: TypedPostfixExpression;
  op: TypedPostfixOp;
}

export const isTypedPostfixExpressionNode = (
  i: TypedExpression,
): i is TypedPostfixExpressionNode => i.type === "PostfixExpression";

export type PostfixOp =
  | ArraySubscriptingOp
  | FunctionCallOp
  | PointerMemberOp
  | StructMemberOp
  | PostfixIncrementOp
  | PostfixDecrementOp;

export type TypedPostfixOp =
  | TypedArraySubscriptingOp
  | TypedFunctionCallOp
  | TypedPointerMemberOp
  | TypedStructMemberOp
  | TypedPostfixIncrementOp
  | TypedPostfixDecrementOp;

export interface ArraySubscriptingOp extends BaseNode {
  type: "ArraySubscripting";
  value: Expression;
}

export interface TypedArraySubscriptingOp extends BaseNode {
  type: "ArraySubscripting";
  value: TypedExpression;
}

export const isTypedArraySubscriptingOp = (
  i: TypedPostfixOp,
): i is TypedArraySubscriptingOp => i.type === "ArraySubscripting";

export interface FunctionCallOp extends BaseNode {
  type: "FunctionCall";
  value: ArgumentExpressionList;
}

export interface TypedFunctionCallOp extends BaseNode {
  type: "FunctionCall";
  value: TypedArgumentExpressionList;
}

export type ArgumentExpressionList = AssignmentExpression[];

export type TypedArgumentExpressionList = TypedAssignmentExpression[];

export interface PointerMemberOp extends BaseNode {
  type: "PointerMember";
  value: Identifier;
}

export interface TypedPointerMemberOp extends BaseNode {
  type: "PointerMember";
  value: Identifier;
}

export interface StructMemberOp extends BaseNode {
  type: "StructMember";
  value: Identifier;
}

export interface TypedStructMemberOp extends BaseNode {
  type: "StructMember";
  value: Identifier;
}

export interface PostfixIncrementOp extends BaseNode {
  type: "PostfixIncrement";
}

export interface TypedPostfixIncrementOp extends BaseNode {
  type: "PostfixIncrement";
}

export interface PostfixDecrementOp extends BaseNode {
  type: "PostfixDecrement";
}

export interface TypedPostfixDecrementOp extends BaseNode {
  type: "PostfixDecrement";
}

export type PrimaryExpression =
  | PrimaryExprIdentifier
  | PrimaryExprConstant
  | PrimaryExprString
  | PrimaryExprParenthesis;

export type TypedPrimaryExpression =
  | TypedPrimaryExprIdentifier
  | TypedPrimaryExprConstant
  | TypedPrimaryExprString
  | TypedPrimaryExprParenthesis;

export interface PrimaryExprIdentifier extends BaseNode {
  type: "PrimaryExprIdentifier";
  value: Identifier;
}

export const isPrimaryExprIdentifier = (
  i: BaseNode,
): i is PrimaryExprIdentifier => i.type === "PrimaryExprIdentifier";

export interface TypedPrimaryExprIdentifier extends TypedExpressionBaseNode {
  type: "PrimaryExprIdentifier";
  value: Identifier;
}

export interface PrimaryExprConstant extends BaseNode {
  type: "PrimaryExprConstant";
  value: Constant;
}

export const isPrimaryExprConstant = (i: BaseNode): i is PrimaryExprConstant =>
  i.type === "PrimaryExprConstant";

export interface TypedPrimaryExprConstant extends TypedExpressionBaseNode {
  type: "PrimaryExprConstant";
  value: TypedConstant;
}

export const isTypedPrimaryExprConstant = (
  expr: TypedExpression,
): expr is TypedPrimaryExprConstant => expr.type === "PrimaryExprConstant";

export interface PrimaryExprString extends BaseNode {
  type: "PrimaryExprString";
  value: string[];
}

export const isPrimaryExprString = (i: BaseNode): i is PrimaryExprString =>
  i.type === "PrimaryExprString";

export interface TypedPrimaryExprString extends TypedExpressionBaseNode {
  type: "PrimaryExprString";
  value: string[];
}

export interface PrimaryExprParenthesis extends BaseNode {
  type: "PrimaryExprParenthesis";
  value: Expression;
}

export const isPrimaryExprParenthesis = (
  i: BaseNode,
): i is PrimaryExprParenthesis => i.type === "PrimaryExprParenthesis";

export interface TypedPrimaryExprParenthesis extends TypedExpressionBaseNode {
  type: "PrimaryExprParenthesis";
  value: TypedExpression;
}

export type Identifier = string;

export type Constant = IntegerConstant;

export type TypedConstant = TypedIntegerConstant;

export interface IntegerConstant extends BaseNode {
  type: "IntegerConstant";
  value: bigint;
  suffix: IntegerConstantSuffix;
  isDecimal: boolean;
}

export interface TypedIntegerConstant extends TypedExpressionBaseNode {
  type: "IntegerConstant";
  value: bigint;
}

export const isTypedIntegerConstant = (
  expr: TypedConstant,
): expr is TypedIntegerConstant => expr.type === "IntegerConstant";

export interface IntegerConstantSuffix {
  unsigned?: true;
  long?: true;
  longLong?: true;
}
