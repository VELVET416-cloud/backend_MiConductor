const validateSchema = (schema) => {

    return async (req, res, next) => {

        try {

            req.body = await schema.parseAsync(req.body);

            next();

        } catch (error) {

            next(error);

        }

    };

};

export default validateSchema;