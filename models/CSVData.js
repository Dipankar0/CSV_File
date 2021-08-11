const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema(
  {
    data: [],
  },
  { timestamps: true }
);

module.exports = CSVData = mongoose.model('csvData', DataSchema);
