{
  function makeNode(type, value = null) {
    const l = location();
    const node = {
      start: l["start"],
      end: l["end"],
      src: text(),
      type,
    };
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null &&
      !("type" in value)
    ) {
      return { ...node, ...value };
    }
    return { ...node, value };
  }

  function makePostfixOp(type, arg = null) {
    return {
      type,
      arg,
    };
  }

  function makeBinaryExpNode(a, b) {
    if (b.length == 0) return a;
    const [op, right] = b.pop();
    return makeNode("BinaryExpr", {
      left: makeBinaryExpNode(a, b),
      op,
      right,
    });
  }
}

start
  = TranslationUnit 

// ==========
// A.1.1 Lexical elements
// ==========

// (6.4.1) token
Token
  = (
        Keyword
      / Identifier
      / Constant
      / StringLiteral
      / Punctuator
    )
    _

// (6.4.3) ...tokens can be separated by white space; this consists of comments, or white-space characters, or both...
_ "whitespace"
  = (WhiteSpace / LongComment / LineComment)*

// (6.4.3) ...white-space characters (space, horizontal tab, new-line, vertical tab, and formfeed)...
WhiteSpace
  = [ \n\r\t\u000B\u000C]

// (6.4.9.1)
LongComment
  = "/*" (!"*/".)* "*/"

// (6.4.9.2)
LineComment
  = "//" (!"\n" .)*

// ==========
// A.1.2 Keywords
// ==========

// (6.4.1) keyword
Keyword
  = (   
        "auto"
      / "break"
      / "case"
      / "char"
      / "const"
      / "continue"
      / "default"
      / "do"
      / "double"
      / "else"
      / "enum"
      / "extern"
      / "float"
      / "for"
      / "goto"
      / "if"
      / "inline"
      / "int"
      / "long"
      / "register"
      / "restrict"
      / "return"
      / "short"
      / "signed"
      / "sizeof"
      / "static"
      / "struct"
      / "switch"
      / "typedef"
      / "union"
      / "unsigned"
      / "void"
      / "volatile"
      / "while"
      / "_Alignas"
      / "_Alignof"
      / "_Atomic"
      / "_Bool"
      / "_Complex"
      / "_Generic"
      / "_Imaginary"
      / "_Noreturn"
      / "_Static_assert"
      / "_Thread_local"
    )
    !(IdentifierNondigit / Digit)
    _

AUTO          = a:"auto"            !(IdentifierNondigit / Digit) _ { return a; }
BREAK         = a:"break"           !(IdentifierNondigit / Digit) _ { return a; }
CASE          = a:"case"            !(IdentifierNondigit / Digit) _ { return a; }
CHAR          = a:"char"            !(IdentifierNondigit / Digit) _ { return a; }
CONST         = a:"const"           !(IdentifierNondigit / Digit) _ { return a; }
CONTINUE      = a:"continue"        !(IdentifierNondigit / Digit) _ { return a; }
DEFAULT       = a:"default"         !(IdentifierNondigit / Digit) _ { return a; }
DO            = a:"do"              !(IdentifierNondigit / Digit) _ { return a; }
DOUBLE        = a:"double"          !(IdentifierNondigit / Digit) _ { return a; }
ELSE          = a:"else"            !(IdentifierNondigit / Digit) _ { return a; }
ENUM          = a:"enum"            !(IdentifierNondigit / Digit) _ { return a; }
EXTERN        = a:"extern"          !(IdentifierNondigit / Digit) _ { return a; }
FLOAT         = a:"float"           !(IdentifierNondigit / Digit) _ { return a; }
FOR           = a:"for"             !(IdentifierNondigit / Digit) _ { return a; }
GOTO          = a:"goto"            !(IdentifierNondigit / Digit) _ { return a; }
IF            = a:"if"              !(IdentifierNondigit / Digit) _ { return a; }
INLINE        = a:"inline"          !(IdentifierNondigit / Digit) _ { return a; }
INT           = a:"int"             !(IdentifierNondigit / Digit) _ { return a; }
LONG          = a:"long"            !(IdentifierNondigit / Digit) _ { return a; }
REGISTER      = a:"register"        !(IdentifierNondigit / Digit) _ { return a; }
RESTRICT      = a:"restrict"        !(IdentifierNondigit / Digit) _ { return a; }
RETURN        = a:"return"          !(IdentifierNondigit / Digit) _ { return a; }
SHORT         = a:"short"           !(IdentifierNondigit / Digit) _ { return a; }
SIGNED        = a:"signed"          !(IdentifierNondigit / Digit) _ { return a; }
SIZEOF        = a:"sizeof"          !(IdentifierNondigit / Digit) _ { return a; }
STATIC        = a:"static"          !(IdentifierNondigit / Digit) _ { return a; }
STRUCT        = a:"struct"          !(IdentifierNondigit / Digit) _ { return a; }
SWITCH        = a:"switch"          !(IdentifierNondigit / Digit) _ { return a; }
TYPEDEF       = a:"typedef"         !(IdentifierNondigit / Digit) _ { return a; }
UNION         = a:"union"           !(IdentifierNondigit / Digit) _ { return a; }
UNSIGNED      = a:"unsigned"        !(IdentifierNondigit / Digit) _ { return a; }
VOID          = a:"void"            !(IdentifierNondigit / Digit) _ { return a; }
VOLATILE      = a:"volatile"        !(IdentifierNondigit / Digit) _ { return a; }
WHILE         = a:"while"           !(IdentifierNondigit / Digit) _ { return a; }
ALIGNAS       = a:"_Alignas"        !(IdentifierNondigit / Digit) _ { return a; }
ALIGNOF       = a:"_Alignof"        !(IdentifierNondigit / Digit) _ { return a; }
ATOMIC        = a:"_Atomic"         !(IdentifierNondigit / Digit) _ { return a; }
BOOL          = a:"_Bool"           !(IdentifierNondigit / Digit) _ { return a; }
COMPLEX       = a:"_Complex"        !(IdentifierNondigit / Digit) _ { return a; }
GENERIC       = a:"_Generic"        !(IdentifierNondigit / Digit) _ { return a; }
IMAGINARY     = a:"_Imaginary"      !(IdentifierNondigit / Digit) _ { return a; }
NORETURN      = a:"_Noreturn"       !(IdentifierNondigit / Digit) _ { return a; }
STATICASSERT  = a:"_Static_assert"  !(IdentifierNondigit / Digit) _ { return a; }
THREADLOCAL   = a:"_Thread_local"   !(IdentifierNondigit / Digit) _ { return a; }

// ==========
// A.1.3 Identifiers
// ==========

// (6.4.2.1) identifier
Identifier
  = !Keyword
    a:IdentifierNondigit
    b:(IdentifierNondigit / Digit)*
    _
    { return a + b.join(""); }

// (6.4.2.1) identifier-nondigit
IdentifierNondigit
  = Nondigit
  / UniversalCharacterName

// (6.4.2.1) nondigit
Nondigit
  = [a-z]
  / [A-Z]
  / [_]

// (6.4.2.1) digit
Digit
  = [0-9]

// ==========
// A.1.4 Universal character names
// ==========

// (6.4.3) universal-character-name
UniversalCharacterName
  = "\\u" a:HexQuad
    { return eval('"\\u' + a.join('') + '"'); }
  / "\\U" a:HexQuad b:HexQuad
    { return eval('"\\U' + a.join('') + b.join('') + '"'); }

// (6.4.3) hex-quad
HexQuad
  = HexadecimalDigit HexadecimalDigit HexadecimalDigit HexadecimalDigit

// ==========
// A.1.5 Constants
// ==========

// (6.4.4) constant
Constant
  = a:(
        FloatingConstant
      / IntegerConstant
      / EnumerationConstant
      / CharacterConstant
    )
    _
    { return a; }

// (6.4.4.1) integer-constant
IntegerConstant
  = a:(DecimalConstant / HexadecimalConstant / OctalConstant)
    IntegerSuffix?
    { return a; }

// (6.4.4.1) decimal-constant
DecimalConstant
  = a:NonzeroDigit b:Digit*
    { return Number(a + b.join("")); }

// (6.4.4.1) octal-constant
OctalConstant
  = "0" a:OctalDigit*
    { return makeNode("OctalConstant", a.length ? a.join("") : "0"); }

// (6.4.4.1) hexadecimal-constant
HexadecimalConstant
  = HexadecimalPrefix a:HexadecimalDigit+
    { return makeNode("HexadecimalConstant", a.join("")); }

// (6.4.4.1) hexadecimal-prefix
HexadecimalPrefix
  = "0x"
  / "0X"

// (6.4.4.1) nonzero-digit:
NonzeroDigit
  = [1-9]

// (6.4.4.1) octal-digit
OctalDigit
  = [0-7]

// (6.4.4.1) hexadecimal-digit
HexadecimalDigit 
  = [0-9]
  / [a-f]
  / [A-F]

// (6.4.4.1) integer-suffix
IntegerSuffix
  = UnsignedSuffix (LongSuffix / LongLongSuffix)?
  / (LongSuffix / LongLongSuffix) UnsignedSuffix?

// (6.4.4.1) unsigned-suffix
UnsignedSuffix
  = [uU]

// (6.4.4.1) long-suffix
LongSuffix
  = [lL]

// (6.4.4.1) long-long-suffix
LongLongSuffix
  = "ll"
  / "LL"

// (6.4.4.2) floating-constant
FloatingConstant
  = DecimalFloatingConstant
  / HexadecimalFloatingConstant

// (6.4.4.2) decimal-floating-constant
DecimalFloatingConstant
  = a:FractionalConstant b:ExponentPart? FloatingSuffix?
    { return Number(a + (b || '')); }
  / a:DigitSequence b:ExponentPart FloatingSuffix?
    { return Number(a.join('') + b); }

// (6.4.4.2) hexadecimal-floating-constant
HexadecimalFloatingConstant
  = a:HexadecimalPrefix
    b:HexadecimalFractionalConstant
    c:BinaryExponentPart
    FloatingSuffix?
    { return makeNode("HexadecimalFloatingConstant", a + b + c); }
  / a:HexadecimalPrefix
    b:HexadecimalDigitSequence
    c:BinaryExponentPart
    FloatingSuffix?
    { return makeNode("HexadecimalFloatingConstant", a + b + c); }

// (6.4.4.2) fractional-constant
FractionalConstant
  = a:DigitSequence? "." b:DigitSequence
    { return a.join('') + '.' + b.join(''); }
  / a:DigitSequence "."
    { return a.join(''); }

// (6.4.4.2) exponent-part
ExponentPart
  = a:[eE] b:Sign? c:DigitSequence
    { return a + (b || "") + c.join(''); }

// (6.4.4.2) sign
Sign
  = [+-]

// (6.4.4.2) digit-sequence
DigitSequence
  = Digit+

// (6.4.4.2) hexadecimal-fractional-constant
HexadecimalFractionalConstant
  = a:HexadecimalDigitSequence? "." b:HexadecimalDigitSequence
    { return a.join("") + "." + b.join(""); }
  / a:HexadecimalDigitSequence "."
    { return a.join(""); }

// (6.4.4.2) binary-exponent-part
BinaryExponentPart
  = a:[pP] b:Sign? c:DigitSequence
    { return a + b + c.join(""); }

// (6.4.4.2) hexadecimal-digit-sequence
HexadecimalDigitSequence
  = HexadecimalDigit+

// (6.4.4.2) floating-suffix
FloatingSuffix
  = [flFL]

// (6.4.4.3) enumeration-constant
EnumerationConstant
  = a:Identifier { return makeNode("EnumerationConstant", a); }

// (6.4.4.4) character-constant
CharacterConstant
  = [LuU]? "'" a:CCharSequence "'"
    { return a; }

// (6.4.4.4) c-char-sequence
CCharSequence
  = CChar+

// (6.4.4.4) c-char
CChar
  = EscapeSequence
  / ![\'\n\\] a:.
    { return a; }

// (6.4.4.4) escape-sequence
EscapeSequence
  = SimpleEscapeSequence
  / OctalEscapeSequence
  / HexadecimalEscapeSequence
  / UniversalCharacterName

// (6.4.4.4) simple-escape-sequence
SimpleEscapeSequence
  = "\\" a:[\'\"?\\abfnrtv]
    { return eval('"\\' + a + '"'); }

// (6.4.4.4) octal-escape-sequence
OctalEscapeSequence
  = "\\" a:OctalDigit b:OctalDigit? c:OctalDigit?
    { return eval("\"\\" + a + (b || "") + (c || "") + "\""); }  

// (6.4.4.4) hexadecimal-escape-sequence
HexadecimalEscapeSequence
  = "\\x" a:HexadecimalDigit+
    { return eval('"\\x' + a.join("") + '"'); }

// ==========
// A.1.6 String Literals
// ==========

// (6.4.5) string-literal
StringLiteral
  = a:EncodingPrefix? '"' b:SCharSequence? '"' _
    { return makeNode("StringLiteral", { prefix: a, charSequence: b }); }

// (6.4.5) encoding-prefix
EncodingPrefix
  = "u8"
  / [uUL]

// (6.4.5) s-char-sequence
SCharSequence
  = SChar+

// (6.4.5) s-char
SChar
  = EscapeSequence
  / ![\"\n\\] a:.
    { return a; }

// ==========
// A.1.7 Punctuators
// ==========

// (6.4.6) punctuator
Punctuator
  = (
        "["
      / "]"
      / "("
      / ")"
      / "{"
      / "}"
      / "."
      / "->"
      / "++"
      / "--"
      / "&"
      / "*"
      / "+"
      / "-"
      / "~"
      / "!"
      / "/"
      / "%"
      / "<<"
      / ">>"
      / "<"
      / ">"
      / "<="
      / ">="
      / "=="
      / "!="
      / "^"
      / "|"
      / "&&"
      / "||"
      / "?"
      / ":"
      / ";"
      / "..."
      / "="
      / "*="
      / "/="
      / "%="
      / "+="
      / "-="
      / "<<="
      / ">>="
      / "&="
      / "^="
      / "|="
      / ","
      / "#"
      / "##"
      / "<:"
      / ":>"
      / "<%"
      / "%>"
      / "%:"
      / "%:%:"
    )
    _ 

LBRC    = a:("[" / "<:")           _ { return a; }
RBRC    = a:("]" / ":>")           _ { return a; }
LPAR    = a:"("                    _ { return a; }
RPAR    = a:")"                    _ { return a; }
LCUR    = a:("{" / "<%")           _ { return a; }
RCUR    = a:("}" / "%>")           _ { return a; }
DOT     = a:"."            !".."   _ { return a; }
ARRW    = a:"->"                   _ { return a; }
INCR    = a:"++"                   _ { return a; }
DECR    = a:"--"                   _ { return a; }
AND     = a:"&"            ![&=]   _ { return a; }
STAR    = a:"*"            ![=]    _ { return a; }
PLUS    = a:"+"            ![+=]   _ { return a; }
MINUS   = a:"-"            ![-=>]  _ { return a; }
TILDE   = a:"~"                    _ { return a; }
BANG    = a:"!"            ![=]    _ { return a; }
DIV     = a:"/"            ![=]    _ { return a; }
MOD     = a:"%"            ![>:=]  _ { return a; }
LSHFT   = a:"<<"           ![=]    _ { return a; }
RSHFT   = a:">>"           ![=]    _ { return a; }
LT      = a:"<"            ![:%<=] _ { return a; }
GT      = a:">"            ![:%>=] _ { return a; }
LEQ     = a:"<="                   _ { return a; }
GEQ     = a:">="                   _ { return a; }
EQEQ    = a:"=="                   _ { return a; }
BANGEQ  = a:"!="                   _ { return a; }
CARET   = a:"^"            ![=]    _ { return a; }
OR      = a:"|"            ![=|]   _ { return a; }
ANDAND  = a:"&&"                   _ { return a; }
OROR    = a:"||"                   _ { return a; }
QN      = a:"?"                    _ { return a; }
COLON   = a:":"            ![>]    _ { return a; }
SEMI    = a:";"                    _ { return a; }
ELLIP   = a:"..."                  _ { return a; }
EQ      = a:"="            ![=]    _ { return a; }
STAREQ  = a:"*="                   _ { return a; }
DIVEQ   = a:"/="                   _ { return a; }
MODEQ   = a:"%="                   _ { return a; }
PLUSEQ  = a:"+="                   _ { return a; }
MINUSEQ = a:"-="                   _ { return a; }
LSHFTEQ = a:"<<="                  _ { return a; }
RSHFTEQ = a:">>="                  _ { return a; }
ANDEQ   = a:"&="                   _ { return a; }
CARETEQ = a:"^="                   _ { return a; }
OREQ    = a:"|="                   _ { return a; }
COMMA   = a:","                    _ { return a; }
PND     = a:("#" / "%:")   ![#]    _ { return a; }
PNDPND  = a:("##" / "%:%:")        _ { return a; }

// ==========
// A.2.1 Expressions
// ==========

// (6.5.1) primary-expression
PrimaryExpression
  = a:Identifier
    { return makeNode('PrimaryExprIdentifier', a); }
  / a:Constant
    { return makeNode('PrimaryExprConstant', a); }
  / a:StringLiteral
    { return makeNode('PrimaryExprString', a); }
  / LPAR a:Expression RPAR
    { return makeNode('PrimaryExprParanthesis', a); }
  / GenericSelection

// (6.5.1.1) generic-selection
GenericSelection
  = GENERIC LPAR AssignmentExpression
    COMMA GenericAssocList RPAR

// (6.5.1.1) generic-assoc-list
GenericAssocList
  = GenericAssociation
    (
      COMMA a:GenericAssociation
      { return a; }
    )*

// (6.5.1.1) generic-association
GenericAssociation
  = TypeName COLON AssignmentExpression
  / DEFAULT COLON AssignmentExpression

// (6.5.2) postfix-expression
PostfixExpression
  = a:(
        PrimaryExpression
      / LPAR a:TypeName RPAR
        LCUR b:InitializerList COMMA? RCUR
        {
          // 6.5.2.5 Compound Literals
          return makeNode("CompoundLiteral", {
            type: a,
            initList: b
          });
        }
    )
    b:(
        LBRC x:Expression RBRC
        { return makePostfixOp("ArraySubscripting", x); }
      / LPAR x:ArgumentExpressionList? RPAR
        { return makePostfixOp("FunctionCall", x); }
      / DOT x:Identifier
        { return makePostfixOp("StructMember", x); }
      / ARRW x:Identifier
        { return makePostfixOp("PointerMember", x); }
      / INCR
        { return makePostfixOp("PostfixIncrement"); }
      / DECR
        { return makePostfixOp("PostfixDecrement"); }
    )*
    {
      if (!b.length) return a;
      return makeNode("PostfixExpression", {
        expr: a,
        ops: b
      });
    }

// (6.5.2) argument-expression-list
ArgumentExpressionList
  = a:AssignmentExpression
    b:(
      COMMA c:AssignmentExpression
      { return c; }
    )*
    { return [a].concat(b); }

// (6.5.3) unary-expression
UnaryExpression
  = PostfixExpression
  / INCR a:UnaryExpression
    { return makeNode("UnaryExpressionIncr", a); }
  / DECR UnaryExpression
    { return makeNode("UnaryExpressionDecr", a); }
  / a:UnaryOperator b:CastExpression
    {
      return makeNode("UnaryExpression", {
        op: a,
        expr: b
      });
    }
  / SIZEOF a:UnaryExpression
    { return makeNode("UnaryExpressionSizeofExpr", a); }
  / SIZEOF LPAR a:TypeName RPAR
    { return makeNode("UnaryExpressionSizeofType", a); }
  / ALIGNOF LPAR a:TypeName RPAR
    { return makeNode("UnaryExpressionAlignof", a); }

// (6.5.3) unary-operator
UnaryOperator
  = AND
  / STAR
  / PLUS
  / MINUS
  / TILDE
  / BANG

// (6.5.4) cast-expression
CastExpression
  = UnaryExpression
  / LPAR a:TypeName RPAR b:CastExpression
    {
      return makeNode("CastExpression", {
        type: a,
        expr: b
      });
    }

// (6.5.5) multiplicative-expression
MultiplicativeExpression
  = a:CastExpression b:((STAR / DIV / MOD) CastExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.6) additive-expression
AdditiveExpression
  = a:MultiplicativeExpression
    b:((PLUS / MINUS) MultiplicativeExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.7) shift-expression
ShiftExpression
  = a:AdditiveExpression
    b:((LSHFT / RSHFT) AdditiveExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.8) relational-expression
RelationalExpression
  = a:ShiftExpression
    b:((LT / GT / LEQ / GEQ) ShiftExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.9) equality-expression
EqualityExpression
  = a:RelationalExpression
    b:((EQEQ / BANGEQ) RelationalExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.10) AND-expression
ANDExpression
  = a:EqualityExpression
    b:(AND EqualityExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.11) exclusive-OR-expression
ExclusiveORExpression
  = a:ANDExpression
    b:(CARET ANDExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.12) inclusive-OR-expression
InclusiveORExpression
  = a:ExclusiveORExpression
    b:(OR ExclusiveORExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.13) logical-AND-expression
LogicalANDExpression
  = a:InclusiveORExpression
    b:(ANDAND InclusiveORExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.14) logical-OR-expression
LogicalORExpression
  = a:LogicalANDExpression
    b:(OROR LogicalANDExpression)*
    { return makeBinaryExpNode(a, b); }

// (6.5.15) conditional-expression
ConditionalExpression
  = a:LogicalORExpression
    b:(
      QN c:Expression COLON d:ConditionalExpression
      { return { exprIfTrue: c, exprIfFalse: d }; }
    )?
    {
      if (!b) return a;
      return makeNode("ConditionalExpression", {
        cond: a,
        exprIfTrue: b.exprIfTrue,
        exprIfFalse: b.exprIfFalse
      });
    }

// (6.5.16) assignment-expression
AssignmentExpression
  = a:UnaryExpression b:AssignmentOperator c:AssignmentExpression
    {
      return makeNode("AssignmentExpression", {
        left: a,
        op: b,
        right: c
      });
    }
  / ConditionalExpression

// (6.5.16) assignment-operator
AssignmentOperator
  = EQ
  / STAREQ
  / DIVEQ
  / MODEQ
  / PLUSEQ
  / MINUSEQ
  / LSHFTEQ
  / RSHFTEQ
  / ANDEQ
  / CARETEQ
  / OREQ

// (6.5.17) expression
Expression
  = a:AssignmentExpression
    b:(
      COMMA c:AssignmentExpression
      { return c; }
    )*
    {
      if (!b.length) return a;
      // 6.5.17 Comma operator
      return makeNode("CommaOperator", {
        exprs: [a].concat(b)
      });
    }

// (6.6) constant-expression
ConstantExpression
  = ConditionalExpression

// ==========
// A.2.2 Declarations
// ==========

// (6.7) declaration
Declaration
  = a:DeclarationSpecifiers b:InitDeclaratorList? SEMI
    {
      return makeNode("Declaration", {
        specifiers: a,
        declaratorList: b
      });
    }
  / a:StaticAssertDeclaration
    { return makeNode("DeclarationStaticAssert", a); }

// (6.7) declaration-specifiers
// Note the change from the standard to handle the TypedefName case
DeclarationSpecifiers
  = a:(
        StorageClassSpecifier
      / TypeQualifier
      / FunctionSpecifier
      / AlignmentSpecifier
    )*
    b:TypedefName
    c:(
        StorageClassSpecifier
      / TypeQualifier
      / FunctionSpecifier
      / AlignmentSpecifier
    )*
    { return a.concat([b]).concat(c); }
  / (
        StorageClassSpecifier
      / TypeSpecifier
      / TypeQualifier
      / FunctionSpecifier
      / AlignmentSpecifier
    )+

// (6.7) init-declarator-list
InitDeclaratorList
  = a:InitDeclarator
    b:(
      COMMA c:InitDeclarator
      { return c; }
    )*
    { return [a].concat(b); }

// (6.7) init-declarator
InitDeclarator
  = a:Declarator
    b:(
      EQ c:Initializer
      { return c; }
    )?
  {
    return makeNode("InitDeclarator", {
      declarator: a,
      initializer: b  
    });
  }

// (6.7.1) storage-class-specifier
StorageClassSpecifier
  = TYPEDEF
  / EXTERN
  / STATIC
  / THREADLOCAL
  / AUTO
  / REGISTER

// (6.7.2) type-specifier
// Note that TypedefName has been removed as it leads to ambiguity in the grammar.
// Instead, we change the grammar for DeclarationSpecifiers and SpecifierQualifierList
// to handle the case of TypedefName
TypeSpecifier
  = VOID
  / CHAR
  / SHORT
  / INT
  / LONG
  / FLOAT
  / DOUBLE
  / SIGNED
  / UNSIGNED
  / BOOL
  / COMPLEX
  / AtomicTypeSpecifier
  / StructOrUnionSpecifier
  / EnumSpecifier

// (6.7.2.1) struct-or-union-specifier
StructOrUnionSpecifier
  = StructOrUnion a:Identifier? LCUR b:StructDeclarationList RCUR
    {
      return makeNode("StructOrUnion", {
        identifier: a,
        declarationList: b
      });
    }
  / StructOrUnion a:Identifier
    { return makeNode("StructOrUnion", a); }

// (6.7.2.1) struct-or-union
StructOrUnion
  = STRUCT
  / UNION

// (6.7.2.1) struct-declaration-list
StructDeclarationList
  = StructDeclaration+

// (6.7.2.1) struct-declaration
StructDeclaration
  = SpecifierQualifierList StructDeclaratorList? SEMI
  / StaticAssertDeclaration

// (6.7.2.1) specifier-qualifier-list
// Note the change from the standard to handle the TypedefName case
SpecifierQualifierList
  = (TypeQualifier / AlignmentSpecifier)*
    TypedefName
    (TypeQualifier / AlignmentSpecifier)*
  / (
        TypeSpecifier
      / TypeQualifier
      / AlignmentSpecifier
    )+

// (6.7.2.1) struct-declarator-list
StructDeclaratorList
  = StructDeclarator (COMMA StructDeclarator)*

// (6.7.2.1) struct-declarator
StructDeclarator
  = Declarator
  / Declarator? COLON ConstantExpression

// (6.7.2.2) enum-specifier
EnumSpecifier
  = ENUM Identifier? LCUR EnumeratorList RCUR
  / ENUM Identifier? LCUR EnumeratorList COMMA RCUR
  / ENUM Identifier

// (6.7.2.2) enumerator-list
EnumeratorList
  = Enumerator (COMMA Enumerator)*

// (6.7.2.2) enumerator
Enumerator
  = EnumerationConstant (EQ ConstantExpression)?

// (6.7.2.4) atomic-type-specifier
AtomicTypeSpecifier
  = ATOMIC LPAR TypeName RPAR

// (6.7.3) type-qualifier
TypeQualifier
  = CONST
  / RESTRICT
  / VOLATILE
  / ATOMIC

// (6.7.4) function-specifier
FunctionSpecifier
  = INLINE
  / NORETURN

// (6.7.5) alignment-specifier
AlignmentSpecifier
  = ALIGNAS LPAR (TypeName / ConstantExpression) RPAR

// (6.7.6) declarator
Declarator
  = a:Pointer? b:DirectDeclarator
    {
      return makeNode("Declarator", {
        ptr: a,
        directDeclarator: b
      });
    }

// (6.7.6) direct-declarator
DirectDeclarator
  = a:(
        a:Identifier { return makeNode("Identifier", a); }
      / LPAR a:Declarator RPAR
        { return a; }
    )
    b:(
        LBRC c:TypeQualifierList? d:AssignmentExpression? RBRC
        {
          return makeNode("DirectDeclaratorModifierArray", {
            modifier: c || [],
            expr: d
          });
        }
      / LBRC STATIC c:TypeQualifierList? d:AssignmentExpression RBRC
        {
          return makeNode("DirectDeclaratorModifierArray", {
            modifier: ["static"].concat(c || []),
            expr: d
          });
        }
      / LBRC c:TypeQualifierList STATIC d:AssignmentExpression RBRC
        {
          return makeNode("DirectDeclaratorModifierArray", {
            modifier: ["static"].concat(c),
            expr: d
          });
        }
      / LBRC c:TypeQualifierList? STAR RBRC
        {
          return makeNode("DirectDeclaratorModifierStarArray", {
            modifier: ["*"].concat(c || [])
          });
        }
      / LPAR c:ParameterTypeList RPAR
        {
          return makeNode("DirectDeclaratorModifierParamTypeList", {
            paramTypeList: c
          });
        }
      / LPAR c:IdentifierList? RPAR
        {
          return makeNode("DirectDeclaratorModifierIdentifierList", {
            identifierList: c
          });
        }
    )*
    {
      return makeNode("DirectDeclarator", {
        left: a,
        right: b
      });
    }

// (6.7.6) pointer
Pointer
  = (
      STAR a:TypeQualifierList?
      { return a; }
    )+

// (6.7.6) type-qualifier-list
TypeQualifierList
  = TypeQualifier+

// (6.7.6) parameter-type-list
ParameterTypeList
  = a:ParameterList b:(COMMA ELLIP)?
    {
      return makeNode("ParameterTypeList", {
        paramList: a,
        varargs: b !== null
      });
    }

// (6.7.6) parameter-list
ParameterList
  = a:ParameterDeclaration
    b:(
      COMMA c:ParameterDeclaration
      { return c; }
    )*
    { return [a].concat(b); }

// (6.7.6) parameter-declaration
ParameterDeclaration
  = a:DeclarationSpecifiers
    b:(Declarator / AbstractDeclarator?)
    {
      return makeNode("ParameterDeclaration", {
        specifiers: a,
        declarator: b
      });
    }

// (6.7.6) identifier-list
IdentifierList
  = a:Identifier
    b:(
      COMMA c:Identifier
      { return c; }
    )*
    { return [a].concat(b); }

// (6.7.7) type-name
TypeName
  = a:SpecifierQualifierList b:AbstractDeclarator?
    {
      return makeNode("TypeName", {
        specifierQualifierList: a,
        abstractDeclarator: b
      });
    }

// (6.7.7) abstract-declarator
AbstractDeclarator
  = a:Pointer
    { return makeNode("AbstractDeclaratorPointer", a); }
  / a:Pointer? b:DirectAbstractDeclarator
    {
      return makeNode("AbstractDeclarator", {
        ptr: a,
        declarator: b
      });
    }

// (6.7.7) direct-abstract-declarator
DirectAbstractDeclarator
  = LPAR a:AbstractDeclarator RPAR
    { return a; }
  / (
      LPAR a:AbstractDeclarator RPAR
      { return a; }
    )?
    (
        LBRC TypeQualifierList? AssignmentExpression? RBRC
      / LBRC STATIC TypeQualifierList? AssignmentExpression RBRC
      / LBRC TypeQualifierList STATIC AssignmentExpression RBRC
      / LBRC STAR RBRC
      / LPAR ParameterTypeList? RPAR
    )+

// (6.7.8) typedef-name
TypedefName
  = Identifier

// (6.7.9) initializer
Initializer
  = a:AssignmentExpression
    { return makeNode("InitializerExpr", a); }
  / LCUR a:InitializerList COMMA? RCUR
    { return makeNode("InitializerArray", a); }

// (6.7.9) initializer-list
InitializerList
  = Designation? Initializer
    (COMMA Designation? Initializer)*

// (6.7.9) designation
Designation
  = DesignatorList EQ

// (6.7.9) designator-list
DesignatorList
  = Designator+

// (6.7.9) designator
Designator
  = LBRC ConstantExpression RBRC
  / DOT Identifier

// (6.7.10) static_assert-declaration
StaticAssertDeclaration
  = STATICASSERT LPAR ConstantExpression
    COMMA StringLiteral RPAR SEMI

// ==========
// A.2.3 Statements
// ==========

// (6.8) statement
Statement
  = LabeledStatement
  / CompoundStatement
  / ExpressionStatement
  / SelectionStatement
  / IterationStatement
  / JumpStatement

// (6.8.1) labeled-statement
LabeledStatement
  = Identifier COLON Statement
  / CASE ConstantExpression COLON Statement
  / DEFAULT COLON Statement

// (6.8.2) compound-statement
CompoundStatement
  = LCUR a:BlockItemList? RCUR
    { return makeNode("CompoundStatement", a); }

// (6.8.2) block-item-list
BlockItemList
  = BlockItem+

// (6.8.2) block-item
BlockItem
  = Statement
  / Declaration

// (6.8.3) expression-statement
ExpressionStatement
  = a:Expression? SEMI
    { return makeNode("ExprStatement", a); }

// (6.8.4) selection-statement
SelectionStatement
  = IF LPAR a:Expression RPAR b:Statement
    c:(
      ELSE d:Statement
      { return d; }
    )?
    {
      return makeNode("SelectionStatementIf", {
        expr: a,
        statement: b,
        elseStatement: c
      });
    }
  / SWITCH LPAR a:Expression RPAR b:Statement
    {
      return makeNode("SelectionStatementSwitch", {
        expr: a,
        statement: b
      });
    }

// (6.8.5) iteration-statement
IterationStatement
  = WHILE LPAR a:Expression RPAR b:Statement
    {
      return makeNode("IterationStatementWhile", {
        expr: a,
        statement: b
      });
    }
  / DO a:Statement WHILE
    LPAR b:Expression RPAR SEMI
    {
      return makeNode("IterationStatementDoWhile", {
        expr: b,
        statement: a
      });
    }
  / FOR LPAR a:Expression? SEMI b:Expression?
    SEMI c:Expression? RPAR d:Statement
    {
      return makeNode("IterationStatementFor", {
        initExpr: a,
        controlExpr: b,
        afterIterExpr: c,
        statement: d
      });
    }
  / FOR LPAR a:Declaration b:Expression?
    SEMI c:Expression? RPAR d:Statement
    {
      return makeNode("IterationStatementForDeclaration", {
        declaration: a,
        controlExpr: b,
        afterIterExpr: c,
        statement: d
      });
    }

// (6.8.6) jump-statement
JumpStatement
  = GOTO a:Identifier SEMI
    { return makeNode("JumpStatementGoto", a); }
  / CONTINUE SEMI
    { return makeNode("JumpStatementContinue"); }
  / BREAK SEMI
    { return makeNode("JumpStatementBreak"); }
  / RETURN a:Expression? SEMI
    { return makeNode("JumpStatementReturn", a); }

// ==========
// A.2.4 External Definitions
// ==========

// (6.9) translation-unit
TranslationUnit
  = _ a:ExternalDeclaration+
    { return makeNode("TranslationUnit", a); }

// (6.9) external-declaration
ExternalDeclaration
  = FunctionDefinition
  / Declaration

// (6.9.1) function-definition
FunctionDefinition
  = a:DeclarationSpecifiers
    b:Declarator
    c:DeclarationList?
    d:CompoundStatement
    {
      return makeNode("FunctionDefinition", {
        specifiers: a,
        declarator: b,
        declarationList: c,
        body: d
      });
    }

// (6.9.1) declaration-list
DeclarationList
  = a:Declaration+
    { return makeNode("DeclarationList", a); }
