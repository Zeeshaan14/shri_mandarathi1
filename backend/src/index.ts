import express from "express";
import dotenv from "dotenv";
import orderRouter from "./routes/orders.route.js";
import router from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
dotenv.config();
const app = express();

app.use(express.json());

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
