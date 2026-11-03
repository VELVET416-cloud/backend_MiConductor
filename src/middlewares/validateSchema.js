const validateSchema = (schema, property = "body") => {

    return async (req, res, next) => {

        try {

            const parsed = await schema.parseAsync(
                req[property]
            );

            try {
                req[property] = parsed;
            } catch (_) {
                // Compatibilidad con Express 5: req.query o req.params pueden ser getters sin setter
                Object.defineProperty(req, property, {
                    value: parsed,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }

            next();

        } catch (error) {

            next(error);

        }

    };

};

export default validateSchema;
