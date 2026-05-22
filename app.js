import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes

// GET / - Main page with search, sort, pagination
app.get("/", async (req, res, next) => {
  try {
    const { search, sort = "newest", page = 1 } = req.query;
    const perPage = 10;
    const pageNum = Number(page);

    // Build where clause for filtering
    const where = {};
    if (search) {
      where.title = {
        contains: search,
      };
    }

    // Build orderBy clause
    let orderBy = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    // Calculate pagination
    const skip = (pageNum - 1) * perPage;

    // Get total count and announcements
    const total = await prisma.announcement.count({ where });
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
    });

    const totalPages = Math.ceil(total / perPage);
    const currentPage =
      pageNum < 1
        ? 1
        : pageNum > totalPages && totalPages > 0
          ? totalPages
          : pageNum;

    res.render("index", {
      announcements,
      totalPages,
      currentPage,
      search: search || "",
      sort: sort || "newest",
    });
  } catch (error) {
    next(error);
  }
});

// GET /announcements - Show form to create announcement
app.get("/announcements", (req, res, next) => {
  try {
    res.render("new", {
      errors: {},
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// POST /announcements - Create announcement
app.post("/announcements", async (req, res, next) => {
  try {
    const { title, description, price, category, contactInfo } = req.body;
    const errors = {};

    // Validate title
    if (!title || title.trim().length < 5) {
      errors.title = "Назва має бути не менше 5 символів";
    }
    if (title && title.length > 100) {
      errors.title = "Назва має бути не більше 100 символів";
    }

    // Validate description
    if (!description || description.trim().length < 10) {
      errors.description = "Опис має бути не менше 10 символів";
    }

    // Validate category
    const validCategories = ["sale", "service", "job", "other"];
    if (!category || !validCategories.includes(category)) {
      errors.category = "Оберіть категорію";
    }

    // Validate price
    if (!price || isNaN(price) || Number(price) <= 0) {
      errors.price = "Ціна має бути додатним числом";
    }

    // Validate contact info
    if (!contactInfo || contactInfo.trim().length < 5) {
      errors.contactInfo = "Контактна інформація має бути не менше 5 символів";
    }

    // If there are errors, render form again with errors and data
    if (Object.keys(errors).length > 0) {
      return res.render("new", {
        errors,
        data: req.body,
      });
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        contactInfo: contactInfo.trim(),
      },
    });

    res.redirect(`/announcements/${announcement.id}`);
  } catch (error) {
    next(error);
  }
});

// GET /announcements/:id - Show announcement details
app.get("/announcements/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(404)
        .render("404", { message: "Оголошення не знайдено" });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res
        .status(404)
        .render("404", { message: "Оголошення не знайдено" });
    }

    res.render("announcement", { announcement });
  } catch (error) {
    next(error);
  }
});

// DELETE /announcements/:id - Delete announcement
app.delete("/announcements/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.announcement.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", { message: "Сторінка не знайдена" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).render("error");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
