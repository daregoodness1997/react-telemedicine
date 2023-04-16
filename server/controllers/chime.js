const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

const createMeeting = async (req, res) => {
  const {
    body: { meetingId },
  } = req;
  const response = await chime
    .createMeeting({
      ClientRequestToken: uuid(),
      MediaRegion: process.env.IAM_REGION,
      ExternalMeetingId: meetingId,
    })
    .promise();

  res.json({
    success: response.success,
    msg: response.msg,
    error: response.error,
    data: response,
  });
};

const createAttendee = async (req, res) => {
  const {
    user: { userId },
    body: { meetingId },
  } = req;

  const response = await chime.createAttendee({
    MeetingId: meetingId,
    ExternalUserId: userId,
  });
  res.json({
    success: response.success,
    msg: response.msg,
    error: response.error,
    data: response,
  });
};

const meetingSession = async (req, res) => {
  const {
    query: { meetingId },
  } = req;
  // Retrieve Meetings list
  const meetingsResult = await chime.listMeetings().promise();
  // Can find a Meeting with a specific “external id”
  const foundMeeting = Array.from(meetingsResult.Meetings).find(
    it => it.ExternalMeetingId === meetingId
  );

  // If not, create a new Meeting info.
  const createdMeetingResponse =
    !foundMeeting &&
    (await chime
      .createMeeting({
        ClientRequestToken: uuid(),
        MediaRegion: process.env.IAM_REGION,
        ExternalMeetingId: meetingId,
      })
      .promise());
  // … or use the found meeting data.
  const meetingResponse = foundMeeting
    ? { Meeting: foundMeeting }
    : createdMeetingResponse;

  // Create Attendee info using the existing Meeting info.
  const attendeeResponse = await chime
    .createAttendee({
      MeetingId: meetingResponse.Meeting.MeetingId,
      ExternalUserId: uuid(), // Link the attendee to an identity managed by your application.
    })
    .promise();

  res.json({ attendeeResponse, meetingResponse });
};

module.exports = { createMeeting, createAttendee, meetingSession };
