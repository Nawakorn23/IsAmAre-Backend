const Reservation = require("../models/Reservation");
const User = require("../models/User");
const { options } = require("../routes/coworkings");

//desc    Register user
//route   POST /api/project/auth/register
//access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, telephone, password, role } = req.body;

    // Create user
    const user = await User.create({ name, email, telephone, password, role });

    // Create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, token });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

//desc    Login user
//route   POST /api/project/auth/login
//access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, token });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Cannot convert email or password to string",
    });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//desc    Get current Logged in user
//route   GET /api/project/auth/me
//access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

//desc    Log user out / clear cookie
//route   GET /api/project/auth/logout
//access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};

//@desc         Update account user
//@routes       PUT /api/project/auth/update
//@access       Private
exports.updateMe = async (req, res, next) => {
  try {

    if(req.body.role){
      return res.status(400).json({ success: false,message:"false jaaa"});
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {c
      return res.status(400).json({ success: false,message:"not user" });
    }
    

    res.status(200).json({
      success: true,
      data: user });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc        Delete account user
// @routes      DELETE /api/project/auth/delete
// @access      Private
exports.deleteMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: `Bootcamp not found with id of ${req.params.id}`,
      });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
    next();
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// desc    Get all users
// route   GET /api/project/auth/getallusers
// access  Private
exports.getAllUsers = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators {$gt, $gte, etc}
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = User.find(JSON.parse(queryStr)).populate('reservations');
    query = query.find( {role: "user"} );


    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("email");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.find({role: "user"}).countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const users = await query;

    // Pagination query
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
    });
  }
};