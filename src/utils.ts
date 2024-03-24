import { Declarator, Identifier, ParameterDeclaration } from "./ast/types";

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
    return this.arr.pop() as T;
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

export function getIdentifierFromDeclarator(
  declarator: Declarator,
): Identifier {
  if (declarator.length === 0) throw "empty declarator";
  const i = declarator[0];
  if (i.partType != "identifier")
    throw "expected identifier as first declarator part";
  return i.name;
}

export function isFunctionDeclarator(declarator: Declarator) {
  return declarator.length >= 2 && declarator[1].partType === "function";
}

export function getParamsFromFunctionDeclarator(
  declarator: Declarator,
): ParameterDeclaration[] {
  if (declarator.length === 0) throw "empty declarator";
  if (declarator.length === 1) throw "not function declarator";
  const i = declarator[1];
  if (i.partType != "function")
    throw "expected function as second declarator part";
  return i.argTypes;
}

export function getRandAddress() {
  return Math.floor(Math.random() * 4294967295);
}

// rounds n up to the nearest multiple of m
export function roundUpM(n: number, m: number) {
  return Math.ceil(n / m) * m;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function getParamsFromDeclarator(declarator: any): {
//   varargs: boolean;
//   params: ParameterDeclaration[];
//   ok: boolean;
// } {
//   const modifiers = declarator.directDeclarator.right;
//   if (
//     !modifiers.length ||
//     modifiers[0].type !== "DirectDeclaratorModifierParamTypeList"
//   )
//     return { varargs: false, params: [], ok: false };
//   const { varargs, paramList } = modifiers[0].paramTypeList;
//   const params: ParameterDeclaration[] = [];
//   for (const p of paramList) {
//     params.push({
//       specifiers: p.specifiers.join(" "),
//       identifier: getIdentifierFromDeclarator(p.declarator).value,
//       isPtr: p.declarator.ptr !== null,
//     });
//   }
//   return { varargs, params, ok: true };
// }
