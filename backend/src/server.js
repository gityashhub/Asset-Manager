require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[backend] API listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('[backend] Failed to start:', err.message);
    process.exit(1);
  }
})();
