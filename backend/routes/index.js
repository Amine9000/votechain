const express = require('express');
const router = express.Router();

// Import Voter and Candidate routers
const voterRouter = require('../routes/voterRouter');
const candidateRouter = require('../routes/condidateRouter');

// Use the routers for their respective routes
router.use('/voters', voterRouter);
router.use('/candidates', candidateRouter);

module.exports = router;
