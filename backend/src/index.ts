import express from "express";
import router from "./routes/auth.js";


const app = express();
app.use(express.json());

app.use("/auth", router);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
