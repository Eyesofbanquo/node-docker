import { message, danger, warn, fail, markdown } from "danger";
import * as glob from "glob";

const pr_body = danger.github.pr.body;

if (pr_body.length === 0) {
  warn("This PR needs a body.");
}

if (danger.git.commits.length > 10) {
  warn("There are a total of " + danger.git.commits.length + " commits.");
  markdown("> 👀 Try to stay under `10` commits **per PR**.");
}

const modifiedMD = danger.git.modified_files.join(" | ");
message("Changed Files in this PR: \n | " + modifiedMD);

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
    glob.glob(`./src/api/${route}/${route}.test.ts`, (err, matches) => {
      if (matches.length === 0 || err) {
        fail(`Missing test file for /${route} route.`);
        markdown(
          "> 💡 Please add the test file to the path `src/api/" +
            route +
            "/`" +
            "\n This is for project consistency."
        );
      }
    });
  });

  /* Check to see that the queries file exists */
  /* Check to see that the schema file exists */
});
