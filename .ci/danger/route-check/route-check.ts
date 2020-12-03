import { glob } from "glob";
import { message, danger, warn, fail, markdown } from "danger";

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

export const routeChecker = () => {
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
