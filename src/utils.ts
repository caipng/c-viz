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
    return this.arr.pop();
  }

  push(x: T): void {
    this.arr.push(x);
  }

  peek(): T {
    if (this.isEmpty()) throw new RangeError("peek at empty stack");
    return this.arr[this.size() - 1];
  }
}
