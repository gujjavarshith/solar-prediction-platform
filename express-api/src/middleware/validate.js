// Input validation middleware for prediction endpoints.

function validateLocationPredict(req, res, next) {
  const { city, building_id, installed_capacity } = req.body;

  const errors = [];
  if (!city || typeof city !== "string") {
    errors.push("'city' is required (string, e.g. 'Berlin')");
  }
  if (building_id == null || building_id < 0 || building_id > 49) {
    errors.push("'building_id' is required (integer, 0–49)");
  }
  if (!installed_capacity || installed_capacity <= 0) {
    errors.push("'installed_capacity' is required (positive number, in kW)");
  }

  // Optional datetime validation
  const { datetime } = req.body;
  if (datetime !== undefined) {
    const dt = new Date(datetime);
    if (isNaN(dt.getTime())) {
      errors.push("'datetime' must be a valid ISO 8601 string, e.g. '2026-04-03T14:00:00'");
    } else {
      const now = new Date();
      const maxForecast = new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000); // 16 days
      if (dt > maxForecast) {
        errors.push("'datetime' cannot be more than 16 days in the future (Open-Meteo forecast limit)");
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

function validateManualPredict(req, res, next) {
  const { building_id, installed_capacity, temperature } = req.body;

  const errors = [];
  if (building_id == null || building_id < 0 || building_id > 49) {
    errors.push("'building_id' is required (integer, 0–49)");
  }
  if (!installed_capacity || installed_capacity <= 0) {
    errors.push("'installed_capacity' is required (positive number)");
  }
  if (temperature == null) {
    errors.push("'temperature' is required for manual mode");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

module.exports = { validateLocationPredict, validateManualPredict };
