// const validateSchema = (schema) => {

//     return async (req, res, next) => {

//         try {

//             req.body = await schema.parseAsync(req.body);

//             next();

//         } catch (error) {

//             next(error);

//         }

//     };

// };

// export default validateSchema;
const validateSchema = (schema, property = "body") => {

    return async (req, res, next) => {

        try {

            req[property] = await schema.parseAsync(
                req[property]
            );

            next();

        } catch (error) {

            next(error);

        }

    };

};

export default validateSchema;