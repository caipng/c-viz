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
  public readonly size: number;

  public constructor(typeInfo: ObjectTypeInfo) {
    this.typeInfo = typeInfo;
    this.size = typeInfo.size;
  }

  public abstract get bytes(): number[];
}

export class TemporaryObject extends CvizObject {
  private readonly _bytes: number[];
  public readonly address: number | null;

  public constructor(
    typeInfo: ObjectTypeInfo,
    bytes: number[],
    address: number | null = null,
  ) {
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
    this.address = address;
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
  public initialized: boolean;
  private readonly memory: Memory;
  private _identifier: Identifier;

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
    this._identifier = identifier;
    this.memory = memory;
    this.initialized = false;
  }

  public get bytes() {
    return this.memory.getObjectBytes(this.address, this.typeInfo);
  }

  public get identifier() {
    return this._identifier;
  }

  public setIdentifier(i: Identifier) {
    this._identifier = i;
  }
}
