const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const stats = [
    { label: 'Total Devices', value: 24 },
    { label: 'Active Issues', value: 3 },
    { label: 'Resolved Today', value: 8 },
    { label: 'Healthy Devices', value: 21 }
  ];
  res.json(stats);
});

module.exports = router;