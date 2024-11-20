const express = require('express');
const router = express.Router();
const { getCanRecords, getCanRecordById, addCanRecord, updateCanRecord, deleteCanRecord } = require('../controllers/canRecordController');

router.get('/', getCanRecords);
router.get('/:id', getCanRecordById);
router.post('/', addCanRecord);
router.put('/:id', updateCanRecord);
router.delete('/:id', deleteCanRecord);

module.exports = router;
