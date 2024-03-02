const Coworking = require("../models/Coworking");

// @desc        Get all coworkings
// @routes      Get /api/project/coworkings
// @access      Public
exports.getCoworkings = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    //console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);

    //Create operators {$gt, $gte, etc}
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    //finding resource
    query = Coworking.find(JSON.parse(queryStr)).populate("reservations");

    //Select Feilds
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Coworking.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    const coworkings = await query;

    //Pagination query
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    // const coworkings = await Coworking.find(req.query);
    // console.log(req.query);

    res.status(200).json({
      success: true,
      count: coworkings.length,
      pagination,
      data: coworkings,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
    });
  }
};

// @desc        Get single coworking
// @routes      GET /api/project/coworkings/:id
// @access      Public
exports.getCoworking = async (req, res, next) => {
  try {
    const coworking = await Coworking.findById(req.params.id);

    if (!coworking) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: coworking,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc        Create a coworking
// @routes      POST /api/project/coworkings
// @access      Private
exports.createCoworking = async (req, res, next) => {
  // console.log(req.body);
  const coworking = await Coworking.create(req.body);
  res.status(201).json({ success: true, data: coworking });
};

// @desc        Update single coworking
// @routes      PUT /api/project/coworkings/:id
// @access      Private
exports.updateCoworking = async (req, res, next) => {
  try {
    const coworking = await Coworking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coworking) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: coworking,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc        Delete single coworking
// @routes      DELETE /api/project/coworkings/:id
// @access      Private
exports.deleteCoworking = async (req, res, next) => {
  try {
    const coworking = await Coworking.findById(req.params.id);

    if (!coworking) {
      return res.status(400).json({
        success: false,
        message: `Bootcamp not found with id of ${req.params.id}`,
      });
    }

    await coworking.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
