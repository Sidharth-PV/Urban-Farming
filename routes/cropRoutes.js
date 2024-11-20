const express = require('express');
const router = express.Router();
const { getCrops, getCropById, addCrop, updateCrop, deleteCrop } = require('../controllers/cropController');

router.get('/', getCrops);
router.get('/:id', getCropById);
router.post('/', addCrop);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

module.exports = router;
