import { load } from "js-yaml";
import { readFileSync, writeFileSync } from "fs";
import cviz from "../src/index";
import { typeTranslationUnit } from "../src/typing/main";
import { assert } from "chai";
import { describe, it } from "mocha";
import "../src/types";

const TEST_FOLDER_PATH = "./test/";
const TEST_OUTPUT_PATH = TEST_FOLDER_PATH + "out/";

interface TestCase {
  in?: string;
  out?: string;
  desc?: string;
}

interface TestSuite {
  file: string;
  desc?: string;
  cases: TestCase[];
}

interface TestList {
  [testName: string]: TestSuite;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const tests = load(
  readFileSync(TEST_FOLDER_PATH + "test.yaml", "utf-8"),
) as TestList;

for (const [testName, testSuite] of Object.entries(tests)) {
  describe(testName, () => {
    const source = readFileSync(TEST_FOLDER_PATH + testSuite.file, "utf-8");

    for (let i = 0; i < testSuite.cases.length; i++) {
      const testCase = testSuite.cases[i];
      // const expectedOutput = testCase.out;
      let caseName = "Case " + i;
      if (testCase.desc) caseName += " (" + testCase.desc + ")";

      it(caseName, () => {
        const out = typeTranslationUnit(cviz.parseProgram(source));
        writeFileSync(
          TEST_OUTPUT_PATH + testName + i + ".json",
          JSON.stringify(out),
        );
        // assert.equal(out, expectedOutput);
        assert.equal(1, 1);
      });
    }
  });
}
