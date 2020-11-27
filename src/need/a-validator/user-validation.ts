import { body, validationResult, check, sanitizeBody } from "express-validator";

export const userValidationRules = () => {
  return [
    body("username")
      .isLength({ min: 3 })
      .isString()
      .trim()
      .blacklist("\\s")
      .escape(),
    body("password").isLength({ min: 5 }).isString().trim().escape(),
  ];
};
export const validateUser = (request, response, next) => {
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
