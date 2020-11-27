import { Router } from "express";

export const router = Router();

router.use("/health", (request, response) => {
  response.send("ok");
});
