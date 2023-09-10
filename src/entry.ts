import { parse, errorMessage } from "pegjs-util";
import * as cparser from "./cparser";

export default {
  run(source: string) {
    const res = parse(cparser, source);
    if (res.error != null) throw new Error(errorMessage(res.error, true));
    return res.ast;
  },
};
