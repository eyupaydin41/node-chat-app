const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Channel = require(`../models/Channel`);
const { authenticateUser } = require('../lib/auth');
const Response = require('../lib/Response');
const Enum = require('../config/Enum');
const CustomError = require('../lib/CustomError');


router.get('/', authenticateUser , async (req, res) => {
    res.render(`chat`);
});

router.get('/messages/:channelId', authenticateUser, async (req, res) => {
    const { channelId } = req.params;
    try {
        const channel = await Channel.findById(channelId);

        if (!channel) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Kanal Bulunamadı.", "Böyle bir kanal bulunmamaktadır.");

        if (!channel.isPublic && !channel.users.includes(req.user._id)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Erişim İzni Hatası", "Bu kanala erişim izniniz yok.");

        const messages = await Message.find({ channelId }).populate('user', 'email').sort('timestamp');

        let successResponse = Response.successResponse(messages);
        res.status(successResponse.code).json(successResponse);
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/channels', authenticateUser, async (req, res) => {
    try {
        const channels = await Channel.find();

        let successResponse = Response.successResponse(channels);
        res.status(successResponse.code).json(successResponse);
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/channels', authenticateUser, async (req, res) => {
    const { name, description, isPublic, users } = req.body;
    try {
        const channel = new Channel({ name, description, isPublic, users });
        await channel.save();

        let successResponse = Response.successResponse(channel, Enum.HTTP_CODES.CREATED);
        res.status(successResponse.code).json(successResponse);
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});



module.exports = router;
