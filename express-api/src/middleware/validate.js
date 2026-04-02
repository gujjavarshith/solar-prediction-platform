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
