import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const authMiddleware = (req,res,next)=>{

    const token=req.headers.authorization?.split(" ")[1];

    if(!token){

        return res.status(401).json({

            success:false,

            message:"Token requerido"

        });

    }

    try{

        const decoded=jwt.verify(token,env.JWT_SECRET);

        req.user=decoded;

        next();

    }

    catch(error){

        return res.status(401).json({

            success:false,

            message:"Token inválido"

        });

    }

};

export default authMiddleware;