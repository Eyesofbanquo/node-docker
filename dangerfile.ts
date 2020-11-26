import { message, danger } from "danger";

const pr_title = danger.github.pr.title;
message("Looking at " + pr_title);

const modifiedMD = danger.git.modified_files.join("- ");
message("Changed Files in this PR: \n - " + modifiedMD);

const tests = danger.git.fileMatch("./**/*.test.ts");
message("All of the test files: \n " + tests);
