import { message, danger, warn, fail } from "danger";
import * as glob from "glob";

const pr_title = danger.github.pr.title;
message("Looking at " + pr_title);
const pr_body = danger.github.pr.body;

if (pr_body.length === 0) {
  fail("The PR needs a body.");
}

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

const routesSmoker = danger.git.fileMatch("./**/*.route.ts");

message(
  "Here are the routes:" + routesSmoker.getKeyedPaths().created.join(" | ")
);

glob.glob("./**/*.route.ts", (err, matches) => {
  const routes = matches.map((file) => file.split("/").pop());
  const routeNames = routes.map((route) => {
    const components = route.split(".");
    if (
      components.length === 3 &&
      components[1].includes("route") &&
      components[2].includes("ts")
    ) {
      return components[0];
    } else {
      fail("Need to have a test file for " + route);
      return;
    }
  });
  routeNames.forEach((route) => {
    glob.glob(`./src/api/${route}/${route}.test.ts`, (err, matches) => {
      if (matches.length === 0 || err) {
        fail("Cannot find the test file for: " + route);
      }
    });
  });
});
