import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import orderRouter from "./routes/orders.route.js";
import router from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
dotenv.config();
const app = express();

app.use(express.json());
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  "http://localhost:3001",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve local uploads if Cloudinary is not configured or for fallback
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", router);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
