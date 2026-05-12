const express = require("express");
const compression = require("compression");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(cors());
app.use(express.json());

app.get("/api/missions", async (req, res) => {
  console.log("--- GET /api/missions called ---");
  let queryCount = 0;

  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      prisma.mission.findMany({
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          launchDate: true,
          rocket: true,
        },
      }),
      prisma.mission.count(),
    ]);
    queryCount += 2;

    const totalPages = Math.ceil(total / safeLimit);

    console.log(`Executed ${queryCount} database queries for this request.`);

    res.json({
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
