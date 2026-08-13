import ApiError from '../utils/ApiError.js';

// Wraps a zod schema; validates+replaces req.body/query/params with the
// parsed (and thus type-coerced/whitelisted) result.
export default function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      throw new ApiError(400, 'Validation failed', result.error.flatten());
    }

    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;
    next();
  };
}
