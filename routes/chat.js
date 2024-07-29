const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateUser } = require('../lib/auth');
const Response = require('../lib/Response');
const Enum = require('../config/Enum');
const CustomError = require('../lib/CustomError');


router.get('/', authenticateUser , async (req, res) => {
    res.render(`chat`);
});

router.get('/messages', authenticateUser, async (req, res) => {
    try {
        const messages = await Message.find().populate('user', 'email').sort('timestamp');
        res.status(Enum.HTTP_CODES.OK).json(Response.successResponse(messages));
    } catch (err) {
        res.status(Enum.HTTP_CODES.INTERNAL_SERVER_ERROR).json(Response.errorResponse(new CustomError(Enum.HTTP_CODES.INTERNAL_SERVER_ERROR, "Mesaj alınamadı", err.message)));
    }
});

module.exports = router;
