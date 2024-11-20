const express = require('express');
const router = express.Router();
const { getFarmers, getFarmerById, addFarmer, updateFarmer, deleteFarmer } = require('../controllers/farmerController');

router.get('/', getFarmers);
router.get('/:id', getFarmerById);
router.post('/', addFarmer);
router.put('/:id', updateFarmer);
router.delete('/:id', deleteFarmer);

module.exports = router;
