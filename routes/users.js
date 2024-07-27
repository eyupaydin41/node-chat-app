var express = require('express');
var router = express.Router();
var User = require(`../models/User`);
const Response = require('../lib/Response');
const bcrypt = require('bcryptjs');
const { HTTP_CODES } = require('../config/Enum');
const CustomError = require('../lib/CustomError');

router.get('/', async (req, res) => {
    try {
        let users = await User.find({});

        let successResponse = Response.successResponse(users,HTTP_CODES.OK); 
        res.status(successResponse.code).json(successResponse);
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get(`/:id`, async (req,res) => {
    try {
        let user = await User.findById(req.params.id)

        if (!user) throw new CustomError(HTTP_CODES.NOT_FOUND, `User Not Found`,`Not found user with this id: ${req.params.id}`);

        let successResponse = Response.successResponse(user);
        res.status(successResponse.code).json(successResponse);
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
})



router.delete(`/:id`, async (req,res) => {
    try {
        let user = await User.findById(req.params.id)

        if (!user) throw new CustomError(HTTP_CODES.NOT_FOUND, `User Not Found`,`Not found user with this id: ${req.params.id}`);

        await User.deleteOne({ _id: req.params.id });

        let successResponse = Response.successResponse({ success: true });
        res.status(successResponse.code).json(successResponse);
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
})

module.exports = router;
