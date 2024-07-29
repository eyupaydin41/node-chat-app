/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enum = require('../config/Enum');
const CustomError = require('../lib/CustomError');
const Response = require('../lib/Response');

const authenticateUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json(Response.errorResponse(new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Yetkilendirme hatası!", "Token eksik veya geçersiz.")));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Kullanıcı hatası!", "Kullanıcı bulunamadı.");
        }

        req.user = user;
        next();
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(Enum.HTTP_CODES.FORBIDDEN).json(Response.errorResponse(new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Yetki hatası!", "Bu işlemi gerçekleştirme yetkiniz yok.")));
        }
        next();
    };
};

module.exports = { authenticateUser, authorizeRoles };
