/* eslint-disable prefer-object-spread */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const fs = require('fs');
const { error } = require('console');
const Tour = require('../models/tourModel');

// JSON input, CheckID and checkBody are no longer needed after Mongo is implemented
// const tours = JSON.parse(
//   fs.readFileSync(`${ __dirname }/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   //console.log(`Name is ${val}`);
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.getAllTours =  async (req, res) => {
  try {
    //BUILD QUERY
    //1) Filtering
    const queryObj = {...req.query};
    const excludeFields = [ 'limit', 'page', 'sort', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);
    
    
    //2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    console.log(JSON.parse(queryStr));

    //EXECUTE QUERY
    const query =  Tour.find(JSON.parse(queryStr));
    const tours = await query;

    //SEND REQUEST
    res.status(200).json({
    status: 'success',
    results: tours.length, //useful when getting an array of objects
    data: {
       tours 
      },
  });
  }catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getTour = async (req, res) => {
  try{
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id })

    res.status(200).json({
    status: 'success',
    data: { tour },
  });
}
  catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.createTour = async (req, res) => {
  // Use of await/promise
  try{
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch(err) {
    res.status(400).json({ 
      status: 'fail',
      message: err,
     })
  }
};
exports.updateTour = async (req, res) => {
  try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { 
      new: true 
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
  catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
  
};
exports.deleteTour = async (req, res) => {
  try{
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data:null
    });
  }
  catch(err) {
    req.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
