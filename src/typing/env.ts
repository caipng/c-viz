import { Identifier } from "../ast/types";
import { Structure, TypeInfo, isStructure } from "./types";

export class TypeEnv {
  private env: Record<Identifier, TypeInfo>[] = [{}];

  enterBlock(): void {
    this.env.push({});
  }

  exitBlock(): void {
    if (this.env.length === 1) throw new RangeError("no block to exit");
    this.env.pop();
  }

  getIdentifierTypeInfo(id: Identifier): TypeInfo {
    for (let i = this.env.length - 1; i >= 0; i--) {
      if (id in this.env[i]) {
        return this.env[i][id];
      }
    }
    throw "identifier " + id + " not declared";
  }

  // see (6.2.3) Name spaces of identifiers
  getTagTypeInfo(tag: Identifier): Structure {
    const id = "tag::" + tag;
    for (let i = this.env.length - 1; i >= 0; i--) {
      if (id in this.env[i]) {
        const t = this.env[i][id];
        if (!isStructure(t)) {
          throw "tag " + tag + " does not refer to a structure";
        }
        return t;
      }
    }
    throw "tag " + tag + " not declared";
  }

  addIdentifierTypeInfo(id: Identifier, t: TypeInfo): void {
    const currBlock = this.env[this.env.length - 1];
    if (id in currBlock) throw "redeclaration of identifier " + id;
    currBlock[id] = t;
  }

  addTagTypeInfo(tag: Identifier, t: Structure): void {
    const currBlock = this.env[this.env.length - 1];
    const id = "tag::" + tag;
    if (id in currBlock) throw "redeclaration of tag " + tag;
    currBlock[id] = t;
  }
}
