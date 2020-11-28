import { json } from "body-parser";
import {
  body,
  header,
  validationResult,
  CustomValidator,
  checkSchema,
} from "express-validator";
import * as jwt from "jsonwebtoken";
import { secret_token } from "../a-secret/secrets";

export const accessTokenValidationRules = () => {
  return checkSchema({
    token: {
      in: ["headers"],
      custom: {
        options: async (value, { req }) => {
          const headerParts = req.headers?.authorization.split(" ");
          const bearer = headerParts[0];
          const token = headerParts[1];

          if (bearer !== "Bearer") {
            return Promise.reject(
              `Authorization needs "Bearer" before the access token.`
            );
          }
          await jwt.verify(token, secret_token, (err, user) => {
            if (err !== null) {
              console.log(err);
              return Promise.reject(
                "Token has expired. Please make a call to /refresh or log in to continue."
              );
            }

            return true;
          });
        },
      },
    },
  });
};
export const validateAccessToken = (request, response, next) => {
  const errors = validationResult(request);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return response.status(422).json({
    success: false,
    error: extractedErrors,
  });
};
