const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory array of items
let items = [
  { id: 1, name: "Book", price: 250 },
  { id: 2, name: "Pen", price: 25 },
];
let nextId = 3;

// ==================== REST API ====================

// GET all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// GET single item by id
app.get("/api/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

// POST – create a new item
app.post("/api/items", (req, res) => {
  const { name, price } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: "Name and Price are required" });
  }
  const newItem = { id: nextId++, name, price: Number(price) };
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT – update an existing item
app.put("/api/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });

  const { name, price } = req.body;
  if (name) item.name = name;
  if (price != null) item.price = Number(price);
  res.json(item);
});

// DELETE – remove an item
app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Item not found" });

  const deleted = items.splice(index, 1);
  res.json(deleted[0]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
