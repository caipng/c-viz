import { Endianness, MemoryConfig, MemoryRegionConfig } from "../config";
import { BIGINT_TO_BYTES } from "../typing/representation";
import { ScalarType } from "../typing/types";
import {
  ExecuteSegmentationFault,
  SegmentationFault,
  WriteSegmentationFault,
} from "./errors";
import { MemoryRegion } from "./memoryRegion";

export interface Segments extends Record<string, MemoryRegion> {
  stack: MemoryRegion;
  heap: MemoryRegion;
  data: MemoryRegion;
  text: MemoryRegion;
}

const checkMemoryConfig = (config: MemoryConfig) => {
  const sortedRegions: MemoryRegionConfig[] = Object.values(config).sort(
    (a, b) => a.baseAddress - b.baseAddress,
  );
  for (let i = 0; i < sortedRegions.length - 1; i++) {
    const a = sortedRegions[i];
    if (
      !(
        Number.isInteger(a.baseAddress) &&
        Number.isInteger(a.size) &&
        a.baseAddress >= 0 &&
        a.size >= 0
      )
    )
      throw "base address and size should be non-negative integers";
    const b = sortedRegions[i + 1];
    if (a.baseAddress + a.size >= b.baseAddress)
      throw new RangeError("invalid memory config, regions overlap");
  }
};

export class Memory {
  private readonly segments: Segments;

  constructor(config: MemoryConfig) {
    checkMemoryConfig(config);
    this.segments = {
      stack: new MemoryRegion(config.stack),
      heap: new MemoryRegion(config.heap),
      data: new MemoryRegion(config.data),
      text: new MemoryRegion(config.text),
    };
  }

  private getMemoryRegion(address: number): [keyof Segments, MemoryRegion] {
    for (const [name, region] of Object.entries(this.segments)) {
      if (region.containsAddress(address)) return [name, region];
    }
    throw new SegmentationFault("access " + address);
  }

  public getByte(address: number, toExecute: boolean = false): number {
    const [name, region] = this.getMemoryRegion(address);
    if (toExecute && name !== "text")
      throw new ExecuteSegmentationFault(address);
    return region.getByte(address - region.baseAddress);
  }

  public getBytes(
    address: number,
    size: number,
    toExecute: boolean = false,
  ): number[] {
    const res = [];
    for (let i = 0; i < size; ++i) {
      res.push(this.getByte(address + i, toExecute));
    }
    return res;
  }

  public setByte(address: number, byte: number): void {
    const [name, region] = this.getMemoryRegion(address);
    if (name === "text") throw new WriteSegmentationFault(address);
    region.setByte(address - region.baseAddress, byte);
  }

  public setBytes(address: number, bytes: number[]): void {
    for (let i = 0; i < bytes.length; i++) this.setByte(address + i, bytes[i]);
  }

  public setRepeatedByte(address: number, size: number, byte: number): void {
    for (let i = 0; i < size; i++) this.setByte(address + i, byte);
  }

  public setScalar(
    address: number,
    i: bigint,
    t: ScalarType["type"],
    e: Endianness = "little",
  ): void {
    const bytes = BIGINT_TO_BYTES[t](i, e);
    this.setBytes(address, bytes);
  }
}
