import { Identifier } from "../ast/types";
import { BUILTIN_FUNCTIONS } from "../builtins";
import { Structure, TypeInfo, isStructure } from "./types";

export class TypeEnv {
  private env: Record<Identifier, [TypeInfo, boolean]>[];

  constructor() {
    this.env = [{}];
    for (const [identifier, f] of Object.entries(BUILTIN_FUNCTIONS)) {
      this.addIdentifierTypeInfo(identifier, f.type);
    }
  }

  enterBlock(): void {
    this.env.push({});
  }

  exitBlock(): void {
    if (this.env.length === 1) throw new RangeError("no block to exit");
    this.env.pop();
  }

  getIdentifierTypeInfo(id: Identifier, isTypedef: boolean = false): TypeInfo {
    for (let i = this.env.length - 1; i >= 0; i--) {
      if (id in this.env[i]) {
        const [t, b] = this.env[i][id];
        if (isTypedef && !b) throw "identifier " + id + " does not name a type";
        if (!isTypedef && b) throw "identifier " + id + " is a typedef";
        return t;
      }
    }
    throw "identifier " + id + " not declared";
  }

  // see (6.2.3) Name spaces of identifiers
  getTagTypeInfo(tag: Identifier): Structure {
    const id = "tag::" + tag;
    for (let i = this.env.length - 1; i >= 0; i--) {
      if (id in this.env[i]) {
        const t = this.env[i][id][0];
        if (!isStructure(t)) {
          throw "tag " + tag + " does not refer to a structure";
        }
        return t;
      }
    }
    throw "tag " + tag + " not declared";
  }

  addIdentifierTypeInfo(
    id: Identifier,
    t: TypeInfo,
    isTypedef: boolean = false,
  ): void {
    const currBlock = this.env[this.env.length - 1];
    if (id in currBlock) throw "redeclaration of identifier " + id;
    currBlock[id] = [t, isTypedef];
  }

  addTagTypeInfo(tag: Identifier, t: Structure): void {
    const currBlock = this.env[this.env.length - 1];
    const id = "tag::" + tag;
    if (id in currBlock) throw "redeclaration of tag " + tag;
    currBlock[id] = [t, false];
  }
}
