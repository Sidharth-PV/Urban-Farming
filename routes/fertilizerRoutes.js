const express = require('express');
const router = express.Router();
const { getFertilizers, getFertilizerById, addFertilizer, updateFertilizer, deleteFertilizer } = require('../controllers/fertilizerController');

router.get('/', getFertilizers);
router.get('/:id', getFertilizerById);
router.post('/', addFertilizer);
router.put('/:id', updateFertilizer);
router.delete('/:id', deleteFertilizer);

module.exports = router;
