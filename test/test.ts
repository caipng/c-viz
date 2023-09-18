import { load } from "js-yaml";
import { readFileSync, writeFileSync } from "fs";
import cviz from "../src/entry";
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

const tests = load(
  readFileSync(TEST_FOLDER_PATH + "test.yaml", "utf-8"),
) as TestList;

for (const [testName, testSuite] of Object.entries(tests)) {
  describe(testName, () => {
    const source = readFileSync(TEST_FOLDER_PATH + testSuite.file, "utf-8");

    for (let i = 0; i < testSuite.cases.length; i++) {
      const testCase = testSuite.cases[i];
      const expectedOutput = testCase.out;
      let caseName = "Case " + i;
      if (testCase.desc) caseName += " (" + testCase.desc + ")";

      it(caseName, () => {
        const out = cviz.run(source);
        writeFileSync(
          TEST_OUTPUT_PATH + testName + i + ".json",
          JSON.stringify(out),
        );
        assert.equal(out, expectedOutput);
      });
    }
  });
}
