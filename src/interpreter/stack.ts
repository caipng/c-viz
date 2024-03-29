import { Identifier, TypedCompoundStatement } from "../ast/types";
import { ObjectTypeInfo, ParameterTypeAndIdentifier } from "../typing/types";
import { Stack } from "../utils";

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

  constructor(stackBaseAddress: number) {
    super();
    this._rbp = stackBaseAddress;
    this._rsp = stackBaseAddress;
  }

  override push(x: StackFrame): void {
    super.push(x);
    this._rbp = this._rsp + 1;
    this._rsp += RuntimeStack.getStackFrameSize(x);
  }

  override pop(): StackFrame {
    const res = super.pop();
    this._rsp = this._rbp - 1;
    if (super.isEmpty()) this._rbp = this._rsp;
    else
      this._rbp = this._rsp - RuntimeStack.getStackFrameSize(super.peek()) + 1;
    return res;
  }

  get rbp(): number {
    return this._rbp;
  }

  get rsp(): number {
    return this._rsp;
  }

  static calculateStackFrame(
    params: ParameterTypeAndIdentifier[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    body: TypedCompoundStatement,
  ): StackFrame {
    const res: StackFrame = {};
    let ptr = 0;
    for (const p of params) {
      if (!p.identifier) throw new Error("param missing identifier");
      res[p.identifier] = {
        address: ptr,
        typeInfo: p.type,
      };
      ptr += p.type.size;
    }
    return res;
  }

  static getStackFrameSize(f: StackFrame): number {
    return Object.values(f).reduce((A, i) => A + i.typeInfo.size, 0);
  }
}
