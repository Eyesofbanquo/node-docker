import { message, danger, warn, fail, markdown } from "danger";
import * as glob from "glob";

if (danger.git.commits.length > 10) {
  warn(
    "There are a total of " +
      danger.git.commits.length +
      " commits." +
      "\n\n" +
      "> 💡 Try to stay under `10` commits **per PR**."
  );
}

const modifiedMD = danger.git.modified_files
  .map((file) => "* " + file)
  .join("\n\n");
message("Changed Files in this PR: \n\n " + modifiedMD);

/**
 * Checking to see if test, queries, schema files are present for every route file in /src/api/endpoint-name
 * @param props Name of route
 */
const endpointFileChecks = (props: { name: string }) => {
  const { name } = props;
  glob.glob(
    `./src/api/${name}/${name}.{test,queries,schema}.ts`,
    (err, matches) => {
      const needs = ["test", "queries", "schema"];
      const failMessages = needs
        .filter(
          (need) => matches.find((match) => match.includes(need)) === undefined
        )
        .map(
          (need) =>
            `**Missing ${need} for** \`/${name}\`\n\nPlease add a \`${name}.${need}.ts\` file to the path \`src/api/${name}\``
        )
        .join("\n\n");

      if (failMessages.length !== 0 || err) {
        fail(failMessages);
      }
    }
  );
};

const routeChecker = () => {
  glob.glob("./src/api/**/*.route.ts", (err, matches) => {
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

    /* Check to see that the test file exists */
    routeNames.forEach((route) => {
      endpointFileChecks({ name: route });
    });
  });
};

const commits = danger.github.commits;

const setupCommits = commits.find((commit) =>
  commit.commit.message.includes("🔓")
);
const actionCommits = commits.find((commit) =>
  commit.commit.message.includes("🎬")
);
const testCommits = commits.find((commit) =>
  commit.commit.message.includes("🔒")
);

const grader = () => {
  if (setupCommits === undefined) {
    warn(
      "Missing a commit indicating the setup for this PR. Please include commit with 🔓 in the title next time."
    );
  }
  if (actionCommits === undefined) {
    warn(
      "Missing a commit indicating the action for this PR. Please include commit with 🎬 in the title next time."
    );
  }
  if (testCommits === undefined) {
    warn(
      "Missing a commit indicating the test for this PR. Please include commit with 🔒 in the title next time."
    );
  }
};

routeChecker();
grader();
