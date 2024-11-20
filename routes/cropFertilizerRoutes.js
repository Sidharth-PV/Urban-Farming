const express = require('express');
const router = express.Router();
const { getCropFertilizers, getCropFertilizerById, addCropFertilizer, updateCropFertilizer, deleteCropFertilizer } = require('../controllers/cropFertilizerController');

router.get('/', getCropFertilizers);
router.get('/:id', getCropFertilizerById);
router.post('/', addCropFertilizer);
router.put('/:id', updateCropFertilizer);
router.delete('/:id', deleteCropFertilizer);

module.exports = router;
