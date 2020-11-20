import express, { Router, Application } from "express";
import * as bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.get("/", (request, response) => {
  response.send({ success: true });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});
