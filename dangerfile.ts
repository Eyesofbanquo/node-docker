import { message, danger, warn } from "danger";

const pr_title = danger.github.pr.title;
message("Looking at " + pr_title);

const modifiedMD = danger.git.modified_files.join("- ");
message("Changed Files in this PR: \n - " + modifiedMD);

const commits = danger.git.commits;
const commitsWithoutMessages = commits.filter(
  (commit) => commit.message.length === 0
);

if (commitsWithoutMessages.length > 0) {
  warn(
    "These commits should've had messages:\n" +
      commitsWithoutMessages.join("\n")
  );
}

const routes = danger.git.modified_files.filter((modifiedFile) =>
  modifiedFile.includes("route")
);

const routesWithoutTests = routes.filter(
  (route) => danger.git.modified_files.includes(`${route}.test.ts`) === false
);

if (routesWithoutTests.length > 0 && routes.length > 0) {
  message(
    "The following routes need tests: \n" + routesWithoutTests.join("\n")
  );
}
