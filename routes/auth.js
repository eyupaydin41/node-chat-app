const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Response = require('../lib/Response');
const CustomError = require('../lib/CustomError');
const Enum = require('../config/Enum');

router.post(`/register`, async (req, res) => {
    const { email, password } = req.body;

    try {
        // email / password kontrolleri gelecek

        const user = await User.create({ email, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'E-posta Doğrulama',
            text: `Doğrulama için tıklayın: ${process.env.CLIENT_URL}/auth/verify-email?token=${token}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post(`/login`, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Giriş hatası!", "Email veya şifre yanlış.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Giriş hatası!", "Email veya şifre yanlış.");

        if (!user.isVerified) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Doğrulama hatası!", "Lütfen hesabınızı email üzerinden doğrulayın.");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        let userData = {
            _id: user._id,
            email: user.email
        };

        res.json(Response.successResponse({ token, user: userData }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(Enum.HTTP_CODES.BAD_REQUEST).json(Response.errorResponse(new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Doğrulama hatası!", "Geçersiz veya eksik doğrulama token'ı.")));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Doğrulama hatası!", "Kullanıcı bulunamadı.");
        }

        if (user.isVerified) {
            return res.status(Enum.HTTP_CODES.OK).json(Response.successResponse({ message: "Hesabınız zaten doğrulanmış." }));
        }

        user.isVerified = true;
        await user.save();

        res.status(Enum.HTTP_CODES.OK).json(Response.successResponse({ message: "Hesabınız başarıyla doğrulandı." }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
