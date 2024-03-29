import { Identifier } from "../ast/types";

export class SymbolTable {
  private blockScopes: Record<Identifier, number>[] = [];
  private fileScope: Record<Identifier, number> = {};

  enterBlock(): void {
    this.blockScopes.push({});
  }

  exitBlock(): void {
    if (this.blockScopes.length === 1) throw new RangeError("no block to exit");
    this.blockScopes.pop();
  }

  getAddress(id: Identifier): number {
    for (let i = this.blockScopes.length - 1; i >= 0; i--) {
      if (id in this.blockScopes[i]) {
        return this.blockScopes[i][id];
      }
    }
    if (id in this.fileScope) {
      return this.fileScope[id];
    }
    throw "identifier " + id + " not declared";
  }

  addAddress(id: Identifier, address: number): void {
    if (this.inFileScope) {
      if (id in this.fileScope)
        throw "identifier " + id + " already exists in file";
      this.fileScope[id] = address;
      return;
    }
    const currBlock = this.blockScopes[this.blockScopes.length - 1];
    if (id in currBlock)
      throw "identifier " + id + " already exists in current block";
    currBlock[id] = address;
  }

  get inFileScope(): boolean {
    return this.blockScopes.length === 0;
  }
}
