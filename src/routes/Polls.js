const express = require('express');
const { createPolls, getPolls, editPolls, deletePolls, getVoteCount, createPollVotes } = require('../controllers/Polls');
 const router = express.Router();

 router.post('/createPolls', createPolls);
 router.get('/getPolls', getPolls);
 router.put('/editPolls/:id', editPolls);
 router.delete('/deletePolls/:id', deletePolls);

 router.post('/createPollVotes', createPollVotes);
 router.get('/getVoteCount/:id', getVoteCount);

module.exports = router;