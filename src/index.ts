import { parse, errorMessage } from "pegjs-util";
import * as cparser from "./cparser";
import { ASTNode, Runtime, evaluate, evaluateNext } from "./interpreter";

export default {
  run(source: string): Runtime {
    const res = parse(cparser, source);
    if (res.error != null) {
      throw new Error(errorMessage(res.error, true));
    }
    const program = res.ast as ASTNode;
    return evaluate(program);
  },
  next(rt: Runtime): Runtime {
    return evaluateNext(rt);
  },
};
