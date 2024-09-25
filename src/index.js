import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
      app.listen(process.env.PORT || 3000, () => {
        console.log(`⚙️ App is listening at: ${process.env.PORT}`);
      });
  })
  .catch((error) => {
    console.log(`MongoDB Connection Failed!!: ${error}`);
  });
