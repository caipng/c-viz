import {
  Identifier,
  TypedCompoundStatement,
  isTypedCompoundStatement,
  isTypedDeclaration,
  isTypedefDeclaration,
} from "../ast/types";
import { ObjectTypeInfo, ParameterTypeAndIdentifier } from "../typing/types";
import { Stack, roundUpM } from "../utils";

export type StackFrame = Record<
  Identifier,
  {
    address: number;
    typeInfo: ObjectTypeInfo;
  }
>;

export class RuntimeStack extends Stack<StackFrame> {
  private _rbp: number;
  private _rsp: number;
  private _rbpStack: Stack<number>;
  private _rspStack: Stack<number>;

  constructor(stackBaseAddress: number) {
    super();
    this._rbp = stackBaseAddress;
    this._rsp = stackBaseAddress;
    this._rbpStack = new Stack();
    this._rspStack = new Stack();
  }

  getRbpArr(): number[] {
    return this._rbpStack.getArr();
  }

  override push(x: StackFrame): void {
    this._rbpStack.push(this._rbp);
    this._rspStack.push(this._rsp);
    super.push(x);

    const [size, alignment] = RuntimeStack.getStackFrameSizeAndAlignment(x);
    this._rbp = roundUpM(this._rsp + 1, alignment);
    this._rsp = this._rbp + size - 1;
  }

  override pop(): StackFrame {
    this._rsp = this._rspStack.pop();
    this._rbp = this._rbpStack.pop();
    return super.pop();
  }

  get rbp(): number {
    return this._rbp;
  }

  get rsp(): number {
    return this._rsp;
  }

  static calculateStackFrame(
    params: ParameterTypeAndIdentifier[],
    body: TypedCompoundStatement,
  ): StackFrame {
    const res: StackFrame = {};
    let ptr = 0;

    for (const p of params) {
      if (!p.identifier) throw new Error("param missing identifier");
      ptr = roundUpM(ptr, p.type.alignment);
      res[p.identifier] = {
        address: ptr,
        typeInfo: p.type,
      };
      ptr += p.type.size;
    }

    const identifierPrefix: string[] = [];
    const scan = (stmts: TypedCompoundStatement): void => {
      let blockNo = 0;
      stmts.value.forEach((i) => {
        if (isTypedDeclaration(i)) {
          i.declaratorList.forEach((j) => {
            const typeInfo = j.typeInfo;
            const qid =
              identifierPrefix.join("::") +
              (identifierPrefix.length ? "::" : "") +
              j.identifier;
            j.qualifiedIdentifier = qid; 
            ptr = roundUpM(ptr, typeInfo.alignment);
            res[qid] = { address: ptr, typeInfo };
            ptr += typeInfo.size;
          });
        } else if (!isTypedefDeclaration(i) && isTypedCompoundStatement(i)) {
          identifierPrefix.push("block" + blockNo);
          scan(i);
          identifierPrefix.pop();
          blockNo++;
        }
      });
    };
    scan(body);

    return res;
  }

  static getStackFrameSizeAndAlignment(f: StackFrame): [number, number] {
    const size = Math.max(
      1,
      ...Object.values(f).map((i) => i.address + i.typeInfo.size),
    );
    const alignment = Math.max(
      1,
      ...Object.values(f).map((i) => i.typeInfo.alignment),
    );
    return [size, alignment];
  }
}
