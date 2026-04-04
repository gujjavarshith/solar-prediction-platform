// Building history route:
//   GET /api/buildings/:id/history — paginated list of past predictions for a building

const express = require("express");
const router = express.Router();
const prisma = require("../services/prisma");

router.get("/api/buildings/:id/history", async (req, res) => {
  try {
    const buildingId = parseInt(req.params.id, 10);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    if (isNaN(buildingId) || buildingId < 0 || buildingId > 49) {
      return res.status(400).json({ error: "building_id must be 0–49" });
    }

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where: { buildingId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          jobId: true,
          pvNormalized: true,
          status: true,
          city: true,
          weather: true,
          installedCapacity: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.prediction.count({ where: { buildingId } }),
    ]);

    res.json({
      building_id: buildingId,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      predictions: predictions.map((p) => ({
        job_id: p.jobId,
        pv_normalized: p.pvNormalized,
        status: p.status,
        city: p.city,
        weather: p.weather,
        installed_capacity: p.installedCapacity,
        created_at: p.createdAt,
        completed_at: p.completedAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/buildings/:id/history error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
