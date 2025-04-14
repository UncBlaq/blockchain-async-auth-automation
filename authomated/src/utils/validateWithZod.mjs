// validateWithZod.js
export const validateWithZod = (schema) => {
    return (req, res, next) => {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
      }
  
      // Attach the validated data to req for later use
      req.validatedData = result.data;
      next();
    };
  };
  

  