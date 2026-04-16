import app from './src/app.js';
import config from "./src/config/env.js"
import connectDB from "./src/config/database.js"

connectDB();
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});
