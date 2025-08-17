import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import orderRouter from "./routes/orders.route.js";
import router from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import userRouter from "./routes/user.routes.js";
import { testImageKitConnection, getImageKitStatus } from "./utils/imagekit.js";
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
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Serve local uploads if ImageKit is not configured or for fallback
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/api/auth", router);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/users", userRouter);

// ImageKit test endpoints
app.get("/api/imagekit/status", (req, res) => {
  res.json(getImageKitStatus());
});

app.get("/api/imagekit/test", async (req, res) => {
  try {
    const isConnected = await testImageKitConnection();
    res.json({ 
      success: isConnected, 
      message: isConnected ? "ImageKit connection successful" : "ImageKit connection failed" 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: "ImageKit test failed", 
      error: error.message 
    });
  }
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
