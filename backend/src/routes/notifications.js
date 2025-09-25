const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const notifications = [
    { message: 'Device DESK-001 is offline', time: '2025-09-09 10:00' },
    { message: 'New issue reported by John Doe', time: '2025-09-09 09:45' }
  ];
  res.json(notifications);
});

module.exports = router;