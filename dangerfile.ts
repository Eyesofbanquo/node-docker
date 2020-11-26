import { message, danger, warn, fail } from "danger";

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

const routes = danger.git.modified_files.filter((modifiedFile) =>
  modifiedFile.includes("route")
);

const routeNames = routes.map((route) => {
  const components = route.split(".");
  if (
    (components.length === 3, components[1] === "test", components[2] === "ts")
  ) {
    return components[0];
  } else {
    fail(
      "Need to rename the file " +
        route +
        " to follow endpoint route name pattern. Consult README"
    );
    return;
  }
});

message("Routes with names: \n" + routeNames.join("\n"));

const routesWithoutTests = routeNames.filter(
  (route) => danger.git.modified_files.includes(`${route}.test.ts`) === false
);

if (routesWithoutTests.length > 0 && routes.length > 0) {
  message(
    "The following routes need tests: \n" + routesWithoutTests.join("\n")
  );
}
