import jwt from 'jsonwebtoken';

import authconfig from '../../config/auth';

import { promisify } from 'util';

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({error: 'token not provider'})
    }

    const [, token] = authHeader.split(' ');

    try{
        const decoded = await promisify(jwt.verify)(token, authconfig.secret);

        req.userid = decoded.id;

        return next();
    }catch(err){
        return res.status(401).json({error: 'token invalid'});
    }

    return next();
}