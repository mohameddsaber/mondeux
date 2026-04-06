import { ZodError } from 'zod';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    next(error);
  }
};
