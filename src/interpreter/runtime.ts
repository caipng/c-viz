import { TypedCompoundStatement, TypedTranslationUnit } from "../ast/types";
import { Memory } from "../memory/memory";
import { Agenda, AgendaItem, isInstruction } from "./agenda";
import { Stash, StashItem } from "./stash";
import { instructionEvaluator, ASTNodeEvaluator } from "./evaluators";
import { RuntimeConfig } from "../config";
import { FunctionDesignator, RuntimeObject } from "./object";
import { SymbolTable } from "./symbolTable";
import { cloneDeep } from "lodash";
import { RuntimeStack, StackFrame } from "./stack";

export type TextandData = (FunctionDesignator | RuntimeObject)[];

export class RuntimeView {
  agenda: AgendaItem[];
  stash: StashItem[];
  textAndData: TextandData;
  stack: StackFrame[];

  constructor(rt: Runtime) {
    this.agenda = rt.agenda.getArr();
    this.stash = rt.stash.getArr();
    this.textAndData = cloneDeep(rt.textAndData);
    this.stack = rt.stack.getArr();
  }
}

export class Runtime {
  public readonly agenda: Agenda;
  public readonly stash: Stash;
  public readonly textAndData: TextandData;
  public readonly symbolTable: SymbolTable;
  public readonly config: RuntimeConfig;
  public readonly memory: Memory;
  public readonly stack: RuntimeStack;

  private functions: TypedCompoundStatement[];
  private _exitCode: number | undefined;
  private _dataPtr: number;
  private _textPtr: number;

  public constructor(program: TypedTranslationUnit, config: RuntimeConfig) {
    this.agenda = new Agenda(program);
    this.stash = new Stash();
    this.textAndData = [];
    this.symbolTable = new SymbolTable();
    this.config = config;
    this.memory = new Memory(config.memory);
    this.stack = new RuntimeStack(config.memory.stack.baseAddress);

    this.functions = [];
    this._exitCode = undefined;
    this._dataPtr = config.memory.data.baseAddress;
    this._textPtr = config.memory.text.baseAddress;
  }

  public next(): void {
    if (this.agenda.isEmpty()) throw new RangeError("agenda is empty");
    const next = this.agenda.pop();
    if (isInstruction(next)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instructionEvaluator[next.type](this, next as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ASTNodeEvaluator[next.type](this, next as any);
    }
  }

  public setExitCode(n: number) {
    this._exitCode = n;
  }

  public get exitCode() {
    return this._exitCode;
  }

  public addFunction(body: TypedCompoundStatement): number {
    return this.functions.push(body) - 1;
  }

  public getFunction(idx: number): TypedCompoundStatement {
    try {
      return this.functions[idx];
    } catch (err) {
      throw "invalid function index " + idx + " provided";
    }
  }

  public allocateAndZeroData(size: number): number {
    this.memory.setRepeatedByte(this._dataPtr, size, 0);
    const address = this._dataPtr;
    this._dataPtr += size;
    return address;
  }

  public allocateText(size: number): number {
    const address = this._textPtr;
    this._textPtr += size;
    return address;
  }
}
