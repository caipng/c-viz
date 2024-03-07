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
  | PostfixIncrementOp
  | PostfixDecrementOp
  | PrimaryExprIdentifier
  | PrimaryExprConstant
  | PrimaryExprString
  | PrimaryExprParanthesis;

export interface TranslationUnit extends BaseNode {
  type: "TranslationUnit";
  value: ExternalDeclaration[];
}

export type ExternalDeclaration = FunctionDefinition | Declaration;

export interface FunctionDefinition extends BaseNode {
  type: "FunctionDefinition";
  specifiers: DeclarationSpecifiers;
  declarator: Declarator;
  body: CompoundStatement;
}

export interface Declaration extends BaseNode {
  type: "Declaration";
  specifiers: DeclarationSpecifiers;
  declaratorList: InitDeclarator[];
}

export type DeclarationSpecifiers = (
  | TypeSpecifier
  | TypeQualifier
  | TypedefName
)[];

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
  | "bool";

export type TypeQualifier = "const";

export type TypedefName = string;

export interface InitDeclarator extends BaseNode {
  type: "InitDeclarator";
  declarator: Declarator;
  initializer: Initializer;
}

export type Initializer = AssignmentExpression;

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

export interface ArrayDeclaratorPart {
  partType: "array";
  length: number;
}

export interface FunctionDeclaratorPart {
  partType: "function";
  argTypes: ParameterDeclaration[];
}

export interface PtrDeclaratorPart {
  partType: "ptr";
  qualifiers: TypeQualifier[];
}

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

export type BlockItem = Statement | Declaration;

export type Statement = CompoundStatement | ExpressionStatement | JumpStatement;

export type JumpStatement = JumpStatementReturn;

export interface JumpStatementReturn extends BaseNode {
  type: "JumpStatementReturn";
  value: Expression | null;
}

export type ExpressionStatement = Expression | EmptyExpressionStatement;

export interface EmptyExpressionStatement extends BaseNode {
  type: "EmptyExpressionStatement";
}

export type Expression = AssignmentExpression | CommaOperator;

export interface CommaOperator extends BaseNode {
  type: "CommaOperator";
  value: AssignmentExpression[];
}

export type AssignmentExpression =
  | ConditionalExpression
  | AssignmentExpressionNode;

export interface AssignmentExpressionNode extends BaseNode {
  type: "AssignmentExpression";
  op: AssignmentOperator;
  left: UnaryExpression;
  right: AssignmentExpression;
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

export interface ConditionalExpressionNode extends BaseNode {
  type: "ConditionalExpression";
  cond: BinaryExpression;
  exprIfTrue: Expression;
  exprIfFalse: ConditionalExpression;
}

export type BinaryExpression = CastExpression | BinaryExpressionNode;

export interface BinaryExpressionNode extends BaseNode {
  type: "BinaryExpr";
  op: BinaryOperator;
  left: BinaryExpression;
  right: BinaryExpression;
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

export type UnaryExpression =
  | PostfixExpression
  | UnaryExpressionIncr
  | UnaryExpressionDecr
  | UnaryExpressionNode;

export interface UnaryExpressionIncr extends BaseNode {
  type: "UnaryExpressionIncr";
  value: UnaryExpression;
}

export interface UnaryExpressionDecr extends BaseNode {
  type: "UnaryExpressionDecr";
  value: UnaryExpression;
}

export interface UnaryExpressionNode extends BaseNode {
  type: "UnaryExpression";
  op: UnaryOperator;
  expr: CastExpression;
}

export type UnaryOperator = "&" | "*" | "+" | "-" | "~" | "!";

export type PostfixExpression = PrimaryExpression | PostfixExpressionNode;

export interface PostfixExpressionNode extends BaseNode {
  type: "PostfixExpression";
  expr: PrimaryExpression;
  ops: PostfixOp[];
}

export type PostfixOp =
  | ArraySubscriptingOp
  | FunctionCallOp
  | PointerMemberOp
  | PostfixIncrementOp
  | PostfixDecrementOp;

export interface ArraySubscriptingOp extends BaseNode {
  type: "ArraySubscripting";
  value: Expression;
}

export interface FunctionCallOp extends BaseNode {
  type: "FunctionCall";
  value: ArgumentExpressionList;
}

export type ArgumentExpressionList = AssignmentExpression[];

export interface PointerMemberOp extends BaseNode {
  type: "PointerMember";
  value: Identifier;
}

export interface PostfixIncrementOp extends BaseNode {
  type: "PostfixIncrement";
}

export interface PostfixDecrementOp extends BaseNode {
  type: "PostfixDecrement";
}

export type PrimaryExpression =
  | PrimaryExprIdentifier
  | PrimaryExprConstant
  | PrimaryExprString
  | PrimaryExprParanthesis;

export interface PrimaryExprIdentifier extends BaseNode {
  type: "PrimaryExprIdentifier";
  value: Identifier;
}

export interface PrimaryExprConstant extends BaseNode {
  type: "PrimaryExprConstant";
  value: Constant;
}

export interface PrimaryExprString extends BaseNode {
  type: "PrimaryExprString";
  value: string[];
}

export interface PrimaryExprParanthesis extends BaseNode {
  type: "PrimaryExprParanthesis";
  value: Expression;
}

export type Identifier = string;

export type Constant = FloatingConstant | IntegerConstant | CharacterConstant;

export type FloatingConstant = number;

export type IntegerConstant = number;

export type CharacterConstant = string[];
