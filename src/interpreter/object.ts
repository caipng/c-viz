import { FunctionType } from "./../typing/types";
import { Identifier } from "./../ast/types";
import { ObjectTypeInfo } from "../typing/types";
import { checkValidByte } from "../utils";
import { Memory } from "../memory/memory";

interface Identifiable {
  identifier: Identifier;
}

interface Addressable {
  address: number;
}

interface IdentifiableAndAddressable extends Identifiable, Addressable {}

export class FunctionDesignator implements IdentifiableAndAddressable {
  public readonly typeInfo: FunctionType;
  public readonly address: number;
  public readonly identifier: Identifier;

  public constructor(
    typeInfo: FunctionType,
    address: number,
    identifier: Identifier,
  ) {
    this.typeInfo = typeInfo;
    this.address = address;
    this.identifier = identifier;
  }
}

// https://en.cppreference.com/w/cpp/language/object
abstract class CvizObject {
  public readonly typeInfo: ObjectTypeInfo;

  public constructor(typeInfo: ObjectTypeInfo) {
    this.typeInfo = typeInfo;
  }

  public abstract get bytes(): number[];
}

export class TemporaryObject extends CvizObject {
  private readonly _bytes: number[];

  public constructor(typeInfo: ObjectTypeInfo, bytes: number[]) {
    super(typeInfo);
    if (typeInfo.size !== bytes.length) {
      throw (
        "invalid number of bytes provided, expected " +
        typeInfo.size +
        " got " +
        bytes.length
      );
    }
    bytes.forEach(checkValidByte);
    this._bytes = bytes;
  }

  public get bytes() {
    return structuredClone(this._bytes);
  }
}

export class RuntimeObject
  extends CvizObject
  implements IdentifiableAndAddressable
{
  public readonly address: number;
  public readonly identifier: Identifier;
  private readonly memory: Memory;

  public constructor(
    typeInfo: ObjectTypeInfo,
    address: number,
    identifier: Identifier,
    memory: Memory,
  ) {
    super(typeInfo);
    this.address = address;
    if (address % typeInfo.alignment)
      throw (
        "misaligned address (" +
        address +
        " with alignment " +
        typeInfo.alignment +
        ")"
      );
    this.identifier = identifier;
    this.memory = memory;
  }

  public get bytes() {
    const res = [];
    for (let i = 0; i < this.typeInfo.size; i++) {
      res.push(this.memory.getByte(this.address + i));
    }
    return res;
  }
}
