import { parse, errorMessage } from "pegjs-util";
import * as cparser from "./cparser";
import { evaluate, evaluateNext } from "./interpreter/interpreter";
import { TranslationUnit } from "./ast/types";
import { Runtime } from "./interpreter/types";

export default {
  parseProgram(source: string): TranslationUnit {
    const res = parse(cparser, source);
    if (res.error != null) {
      throw new Error("\n" + errorMessage(res.error, true));
    }
    return res.ast as TranslationUnit;
  },
  run(source: string): Runtime {
    const program = this.parseProgram(source);
    return evaluate(program);
  },
  next(rt: Runtime): Runtime {
    return evaluateNext(rt);
  },
};
