const express = require('express');
const { createMeeting, meetingSession } = require('../controllers/chime');
const router = express.Router();

router.route('/').post(createMeeting).get(meetingSession);

module.exports = router;
