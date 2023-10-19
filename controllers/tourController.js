/* eslint-disable prefer-object-spread */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const fs = require('fs');
const { error } = require('console');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
// local file no longer needed when MongoDb is used.
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

//MongoDB: Matching and Grouping
exports.getTourStats = async (req, res) => {
  try{
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group:{
          _id: {$toUpper:'$difficulty'},
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        }
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
         stats 
        },
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

//MongoDB: Unwinding and Projecting
exports.getMonthlyPlan = async (req, res) => {
try{
  const year = req.params.year*1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {$match:{
      startDates: { 
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
    },
    }},
    {$group:{
      _id: {$month: '$startDates',},
      numToursStarts: { $sum: 1 },
      tours: { $push: '$name' },
    }},
    {
      $addFields: { month: '$_id' },
    },{
      $project: { 
        _id: 0
      }
    },{
      $sort: {
        numToursStarts: -1,
      },
    },
    {
      $limit: 12,
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
       plan, 
      },
  });

} catch (err) {
  res.status(400).json({
    status: 'fail',
    message: err,
  });
}
}


exports.getAllTours =  catchAsync(async (req, res,next) => {
  const features = new APIFeatures(Tour.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tours = await features.query;

    //SEND REQUEST
    res.status(200).json({
    status: 'success',
    results: tours.length, //useful when getting an array of objects
    data: {
       tours 
      },
    });
});
exports.getTour = catchAsync(async (req, res,next) => {
  const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id })
  if(!tour){
    return next(new AppError('No tour found with that ID', 404));
  }
    res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync (async (req, res, next) => {
  // Use of await/promise
  const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
});

exports.updateTour = catchAsync(async (req, res,next) => {
  
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { 
    new: true,
    runValidators: true,
  });
  if(!tour){
    return next(new AppError('No tour found with that ID', 404));
  };
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour){
    return next(new AppError('No tour found with that ID', 404));
  };
    res.status(204).json({
      status: 'success',
      data:null
    });
});
