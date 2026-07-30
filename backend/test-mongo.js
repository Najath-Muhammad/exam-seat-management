const mongoose = require('mongoose');

const uri = "mongodb+srv://admin_user:8QBL24pmGZoNdmDq@cluster0.w5q9qlf.mongodb.net/?appName=Cluster0";

console.log('Connecting to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
