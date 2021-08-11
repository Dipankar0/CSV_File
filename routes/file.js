const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');

const auth = require('../middleware/authenticate');
const csvData = require('../models/CSVData');

const app = express();

global.__basedir = __dirname;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + '/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  },
});

const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes('csv')) {
    cb(null, true);
  } else {
    cb('Please upload only csv file.', false);
  }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: 'Please upload a CSV file!',
      });
    }

    let results = [];
    let filePath = __basedir + '/uploads/' + req.file.filename;

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', (error) => {
        throw error.message;
      })
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        let newCSVData = await new csvData({ data: results });
        await newCSVData.save();

        res.status(200).json({
          message: 'Data uploaded successfully',
        });
      });
  } catch (error) {
    if (error) {
      console.log(error.message);
    }
  }
});

router.get('/getAllData', auth, async (req, res) => {
  try {
    const allData = await csvData.find();

    res.status(200).send(allData);
  } catch (error) {
    if (error) {
      console.log(error.message);
    }
  }
});

router.get('/getOne/:id', auth, async (req, res) => {
  try {
    const oneData = await csvData.findById(req.params.id);

    if (oneData) {
      res.status(200).send(oneData);
    } else {
      res.status(404).json({
        message: 'No Data found by this ID',
      });
    }
  } catch (error) {
    if (error) {
      console.log(error.message);
    }
  }
});

router.put('/update/:id', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: 'Please upload a CSV file!',
      });
    }

    let results = [];
    let filePath = __basedir + '/uploads/' + req.file.filename;

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', (error) => {
        throw error.message;
      })
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        let oldData = await csvData.findById(req.params.id);
        if (oldData) {
          oldData.data.unshift(results);
          await oldData.save();

          res.status(200).json({
            message: 'Data uploaded successfully',
          });
        } else {
          res.status(404).json({
            message: 'No Data found by this ID',
          });
        }
      });
  } catch (error) {
    if (error) {
      console.log(error.message);
    }
  }
});

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    await csvData.findByIdAndRemove(req.params.id);
    res.status(200).json({
      message: 'Data deleted successfully',
    });
  } catch (error) {
    if (error) {
      console.log(error.message);
    }
  }
});

module.exports = router;
