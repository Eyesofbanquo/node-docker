import { body, validationResult } from "express-validator";

export const refreshTokenValidationRules = () => {
  return [body("refreshToken").isJWT().trim().blacklist("\\s")];
};
export const validateRefreshToken = (request, response, next) => {
  const errors = validationResult(request);

  console.log("hello");
  if (errors.isEmpty()) {
    console.log("hello");
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return response.status(422).json({
    success: false,
    error: extractedErrors,
  });
};
