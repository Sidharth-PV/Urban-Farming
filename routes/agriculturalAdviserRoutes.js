const express = require('express');
const router = express.Router();
const { getAdvisers, getAdviserById, addAdviser, updateAdviser, deleteAdviser } = require('../controllers/agriculturalAdviserController');

router.get('/', getAdvisers);
router.get('/:id', getAdviserById);
router.post('/', addAdviser);
router.put('/:id', updateAdviser);
router.delete('/:id', deleteAdviser);

module.exports = router;
