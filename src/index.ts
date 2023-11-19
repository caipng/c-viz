import { parse, errorMessage } from "pegjs-util";
import * as cparser from "./cparser";
import { ASTNode, Runtime, evaluate, evaluateNext } from "./interpreter";

export default {
  parseProgram(source: string): ASTNode {
    const res = parse(cparser, source);
    if (res.error != null) {
      throw new Error("\n" + errorMessage(res.error, true));
    }
    return res.ast as ASTNode;
  },
  run(source: string): Runtime {
    const program = this.parseProgram(source);
    return evaluate(program);
  },
  next(rt: Runtime): Runtime {
    return evaluateNext(rt);
  },
};
