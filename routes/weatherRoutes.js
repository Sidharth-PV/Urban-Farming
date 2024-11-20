const express = require('express');
const router = express.Router();
const { getWeathers, getWeatherById, addWeather, updateWeather, deleteWeather } = require('../controllers/weatherController');

router.get('/', getWeathers);
router.get('/:id', getWeatherById);
router.post('/', addWeather);
router.put('/:id', updateWeather);
router.delete('/:id', deleteWeather);

module.exports = router;
