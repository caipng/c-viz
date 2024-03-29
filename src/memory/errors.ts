export class MemoryError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, MemoryError.prototype);
  }
}

export class SegmentationFault extends MemoryError {
  constructor(e: string) {
    super("segmentation fault (tried to " + e + ")");
  }
}

export class ReadSegmentationFault extends SegmentationFault {
  constructor(address: number) {
    super("read " + address);
  }
}

export class WriteSegmentationFault extends SegmentationFault {
  constructor(address: number) {
    super("write to " + address);
  }
}

export class ExecuteSegmentationFault extends SegmentationFault {
  constructor(address: number) {
    super("execute " + address);
  }
}
