import { parse, errorMessage } from "pegjs-util";
import * as cparser from "./cparser";
import { TranslationUnit, TypedTranslationUnit } from "./ast/types";
import { typeTranslationUnit } from "./typing/main";
import { Runtime } from "./interpreter/runtime";
import { DEFAULT_CONFIG } from "./config";

export default {
  parseProgram(source: string): TranslationUnit {
    const res = parse(cparser, source);
    if (res.error != null) {
      throw new Error("\n" + errorMessage(res.error, true));
    }
    return res.ast as TranslationUnit;
  },
  typeCheck(t: TranslationUnit): TypedTranslationUnit {
    try {
      return typeTranslationUnit(t);
    } catch (err) {
      throw new Error("" + err);
    }
  },
  run(source: string): Runtime {
    const program = this.parseProgram(source);
    const typedTranslationUnit = this.typeCheck(program);
    return new Runtime(typedTranslationUnit, DEFAULT_CONFIG);
  },
};
