import Book from "../models/Book.js";

export const getBooks = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;

    let filter = {};

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    let sortOption = {};

    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else sortOption.createdAt = -1;

    const books = await Book.find(filter).sort(sortOption);

    res.json(books);

  } catch (err) {
    res.status(500).json(err);
  }
};