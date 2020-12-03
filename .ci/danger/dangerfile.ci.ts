import { message, danger, warn, fail, markdown } from "danger";
import * as glob from "glob";
import { routeChecker } from "./route-check/route-check";
import { grader } from "./pr-grader/pr-grader";

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

routeChecker();
grader();
