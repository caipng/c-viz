import { ParameterDeclaration } from "./interpreter";

export class Stack<T> {
  private arr: T[] = [];

  size(): number {
    return this.arr.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  pop(): T {
    if (this.isEmpty()) throw new RangeError("pop from empty stack");
    return this.arr.pop();
  }

  push(x: T): void {
    this.arr.push(x);
  }

  peek(): T {
    if (this.isEmpty()) throw new RangeError("peek at empty stack");
    return this.arr[this.size() - 1];
  }

  getArr(): T[] {
    return structuredClone(this.arr);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIdentifierFromDeclarator(declarator: any): {
  value: string;
} {
  const l = declarator.directDeclarator.left;
  return l.type === "Identifier" ? l : getIdentifierFromDeclarator(l);
}

export function getRandAddress() {
  return Math.floor(Math.random() * 4294967295);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getParamsFromDeclarator(declarator: any): {
  varargs: boolean;
  params: ParameterDeclaration[];
  ok: boolean;
} {
  const modifiers = declarator.directDeclarator.right;
  if (
    !modifiers.length ||
    modifiers[0].type !== "DirectDeclaratorModifierParamTypeList"
  )
    return { varargs: false, params: [], ok: false };
  const { varargs, paramList } = modifiers[0].paramTypeList;
  const params: ParameterDeclaration[] = [];
  for (const p of paramList) {
    params.push({
      specifiers: p.specifiers.join(" "),
      identifier: getIdentifierFromDeclarator(p.declarator).value,
      isPtr: p.declarator.ptr !== null,
    });
  }
  return { varargs, params, ok: true };
}
