{
  function buildAST(a, b) {
    if (b.length == 0) return a;
    const [op, right] = b.pop();
    return {
      type: "BinaryExpression",
      left: buildAST(a, b),
      op,
      right
    }
  }
}

// (6.8) statement
start = a:Expression { return a; }

// ==========
// A.1.5 Constants
// ==========

// (6.4.4) constant
Constant
  = a:(FloatingConstant / IntegerConstant) { return a; }

// (6.4.4.1) integer-constant
IntegerConstant
  = a:DecimalConstant { return a; }

// (6.4.4.1) decimal constant
DecimalConstant
  = a:[1-9] b:[0-9]* {
    return {type:'DecimalConstant', value:a + b.join("")};
  };

// (6.4.4.2) floating-constant
FloatingConstant
  = a:DecimalFloatingConstant { return a; }

// (6.4.4.2) decimal-floating-constant:
DecimalFloatingConstant
  = a:FractionalConstant b:ExponentPart? FloatingSuffix? {
    return {type: 'DecimalFloatConstant', value: a + (b || '')};
  }
  / a:[0-9]+ b:ExponentPart FloatingSuffix? {
    return {type: 'DecimalFloatConstant', value: a.join('') + b};
  }

// (6.4.4.2) fractional-constant
FractionalConstant
  = a:[0-9]* "." b:[0-9]+ {
    return a.join('') + '.' + b.join('');
  }
  / a:[0-9]+ "." {
    return a.join('');
  }

// (6.4.4.2) exponent-part
ExponentPart
  = a:[eE] b:[+\-]? c:[0-9]+ {
    return a + (b || "") + c.join('')
  };

// (6.4.4.2) floating-suffix
FloatingSuffix
  = a:[flFL] { return a; };

// ==========
// A.1.7 Punctuators
// ==========

LPAR = a:"(" { return a; };
RPAR = a:")" { return a; };
STAR = a:"*" ![=] { return a; };
PLUS = a:"+" ![+=] { return a; };
MINUS = a:"-" ![-=>] { return a; };
DIV = a:"/" ![=] { return a; };
MOD = a:"%" ![=] { return a; };

// ==========
// A.2.1 Expressions
// ==========

// (6.5.1) primary-expression
PrimaryExpression
  = a:Constant { return {type: 'ConstantExpression', Expression: a}; }
  / LPAR a:Expression RPAR { return {type: 'ParenthesesExpression', Expression: a}; }

// (6.5.2) postfix-expression
PostfixExpression
  = a:PrimaryExpression { return a; }

// (6.5.3) unary-expression
UnaryExpression
  = a:PostfixExpression { return a; }

// (6.5.4) cast-expression
CastExpression
  = a:UnaryExpression { return a; }

// note: most of the expressions below are defined left recursively in the standard

// (6.5.5) multiplicative-expression
MultiplicativeExpression
  = a:CastExpression b:((STAR / DIV / MOD) CastExpression)* {
    return buildAST(a, b);
  }

// (6.5.6) additive-expression
AdditiveExpression
  = a:MultiplicativeExpression b:((PLUS / MINUS) MultiplicativeExpression)* {
    return buildAST(a, b);
  }

// (6.5.16) assignment-expression
AssignmentExpression
  = a:AdditiveExpression { return a; }

// (6.5.17) expression
Expression
  = a:AssignmentExpression { return a; }