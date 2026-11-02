const express = require('express');
const { getWorkspaceStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getWorkspaceStats);

module.exports = router;
