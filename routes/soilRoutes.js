const express = require('express');
const router = express.Router();
const { getSoils, getSoilById, addSoil, updateSoil, deleteSoil } = require('../controllers/soilController');

router.get('/', getSoils);
router.get('/:id', getSoilById);
router.post('/', addSoil);
router.put('/:id', updateSoil);
router.delete('/:id', deleteSoil);

module.exports = router;
