const express = require('express');
const router = express.Router();
const { getFields, getFieldById, addField, updateField, deleteField } = require('../controllers/fieldController');

router.get('/', getFields);
router.get('/:id', getFieldById);
router.post('/', addField);
router.put('/:id', updateField);
router.delete('/:id', deleteField);

module.exports = router;
