const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const key = process.argv[2];
    if (!key) {
      console.log('Provide idempotencyKey as arg');
      process.exit(1);
    }
    const arr = await Attempt.find({ idempotencyKey: key }).lean();
    console.log('found attempts count:', arr.length);
    console.log(JSON.stringify(arr, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('error:', err);
    process.exit(1);
  }
})();
