import { ZodError } from 'zod';

const getPropertyDescriptor = (obj, key) => {
  let current = obj;

  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);

    if (descriptor) {
      return descriptor;
    }

    current = Object.getPrototypeOf(current);
  }

  return null;
};

const assignRequestValue = (req, key, value) => {
  const descriptor = getPropertyDescriptor(req, key);

  if (!descriptor || descriptor.writable || typeof descriptor.set === 'function') {
    req[key] = value;
    return;
  }

  Object.defineProperty(req, key, {
    configurable: true,
    enumerable: descriptor.enumerable ?? true,
    writable: true,
    value,
  });
};

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

    assignRequestValue(req, 'body', result.data.body);
    assignRequestValue(req, 'params', result.data.params);
    assignRequestValue(req, 'query', result.data.query);

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
