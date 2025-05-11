
import mongoose from "mongoose";
import Test from "../models/Test.models.js";
import Learner from "../models/LearnerSchema.models.js";


// Create a new test
export const createTest = async (req, res) => {
  try {
    const { learnerId, testType, date, result } = req.body;
    const newTest = new Test({ learnerId, testType, date, result });
    await newTest.save();
    res.status(201).json({ success: true, message: "Test created successfully", test: newTest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating test", error: error.message });
  }
};


// ✅ Get all tests using MongoDB Aggregation
// export const getAllTests = async (req, res) => {
//   try {
//     const { testType, result, gender } = req.query;
    
//     const search = req.query.search ? req.query.search.trim() : "";

//     let page = parseInt(req.query.page, 10);
//     page = isNaN(page) || page < 1 ? 1 : page;

//     let limit = parseInt(req.query.limit, 10);
//     limit = isNaN(limit) || limit < 1 ? 15 : limit;

//     const fromdate = req.query.fromdate || null;
//     const todate = req.query.todate || null;

//     const pageNumber = parseInt(page, 10) || 1;
//     const limitNumber = parseInt(limit, 10) || 15;
//     const skip = (pageNumber - 1) * limitNumber;

//     
//     

//     let searchDate = null;
//     if (!isNaN(Date.parse(search))) {
//       searchDate = new Date(search);
//     }

//     const trimmedSearch = search.trim().replace(/([a-z])([A-Z])/g, "$1.*$2").replace(/\s+/g, ".*");

//     let matchFilter = {};

//     // ✅ Ensure exact matches for `testType`, `result`, and `gender`
//    // Function to normalize spaces in string filters
//    const normalizeFilter = (value) => {
//     if (!value) return null;
//     const normalized = value.replace(/\s+/g, ""); // Remove all spaces
//     return { $regex: `^${normalized.replace(/(.{1})/g, "$1\\s*")}$`, $options: "i" }; // Allow flexible spacing
//     };
  
//   if (testType) matchFilter.testType = normalizeFilter(testType);
//   if (result) matchFilter.result = normalizeFilter(result);
//   if (gender) matchFilter["learner.gender"] = normalizeFilter(gender);

    
//     // ✅ Apply search filters
//     matchFilter.$or = [
//       { "learner.fullName": { $regex: trimmedSearch, $options: "i" } },
//       { "learner.fathersName": { $regex: trimmedSearch, $options: "i" } },
//       { "learner.mobileNumber": { $regex: trimmedSearch, $options: "i" } },
//       { "learner.licenseNumber": { $regex: trimmedSearch, $options: "i" } },
//       { "learner.llrNumber": { $regex: trimmedSearch, $options: "i" } },
//       { "learner.admissionNumber": { $regex: `^\\s*${trimmedSearch}\\s*$`, $options: "i" } },
//       { testType: { $regex: trimmedSearch, $options: "i" } },
//       { result: { $regex: trimmedSearch, $options: "i" } },
//       ...(searchDate
//         ? [
//             { createdAt: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 86400000) } },
//             { updatedAt: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 86400000) } },
//             { date: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 86400000) } },
//           ]
//         : []),
//     ];

//     // ✅ Date range filter
//     if (fromdate || todate) {
//       matchFilter.$and = [
//         ...(matchFilter.$and || []), // Preserve previous filters
//         {
//           date: {
//             ...(fromdate ? { $gte: new Date(`${fromdate}T00:00:00.000Z`) } : {}),
//             ...(todate ? { $lte: new Date(`${todate}T23:59:59.999Z`) } : {}),
//           },
//         },
//       ];
//     }

//     const pipeline = [
//       {
//         $lookup: {
//           from: "learners",
//           localField: "learnerId",
//           foreignField: "_id",
//           as: "learner",
//         },
//       },
//       { $unwind: "$learner" },
//       { $match: matchFilter }, // ✅ Now `testType` & `result` filters will work
//       {
//         $project: {
//           learnerId: 0,
//           "__v": 0,
//           "learner.__v": 0,
//         },
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "totalTests" }],
//           data: [{ $skip: skip }, { $limit: limitNumber }],
//         },
//       },
//     ];

//     const results = await Test.aggregate(pipeline);
//     const tests = results[0].data || [];
//     const totalTests = results[0].metadata[0] ? results[0].metadata[0].totalTests : 0;
//     const totalPages = Math.ceil(totalTests / limitNumber);

//     

//     res.status(200).json({
//       success: true,
//       totalPages,
//       currentPage: pageNumber,
//       totalTests,
//       tests,
//     });
//   } catch (error) {
//     console.error("❌ Error Fetching Tests:", error);
//     res.status(500).json({ success: false, message: "Error fetching tests", error: error.message });
//   }
// };
export const getAllTests = async (req, res) => {
  try {
    const {  testType, result, gender } = req.query;
    const id = req.params.id;
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    const search = req.query.search ? req.query.search.trim() : "";

    // ✅ If page & limit are missing, fetch all data
    const paginate = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;
    const fromdate = req.query.fromdate || null;
    const todate = req.query.todate || null;
    const date =req.query.date ||null;

    let matchFilter = {};

    // ✅ Normalize filters
    const normalizeFilter = (value) => {
      if (!value) return null;
      const normalized = value.replace(/\s+/g, ""); // Remove spaces
      return { $regex: `^${normalized.replace(/(.{1})/g, "$1\\s*")}$`, $options: "i" }; // Allow flexible spacing
    };
    
    if (id) matchFilter["learner._id"] = new mongoose.Types.ObjectId(id);
    if (testType) matchFilter.testType = normalizeFilter(testType);
    if (result) matchFilter.result = normalizeFilter(result);
    if (gender) matchFilter["learner.gender"] = normalizeFilter(gender);
    
      // ✅ Handle search logic
      const datePattern = /^\d{2}-\d{2}-\d{4}$/;
      let parsedSearchDate = null;
  
      if (datePattern.test(search)) {
        const [day, month, year] = search.split("-");
        parsedSearchDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
        // console.log(parsedSearchDate);
        
      } else if (!isNaN(Date.parse(search))) {
        parsedSearchDate = new Date(search); // fallback for ISO format
      }
  
      if (search) {
        const trimmedSearch = search
          .trim()
          .replace(/([a-z])([A-Z])/g, "$1.*$2")
          .replace(/\s+/g, ".*");
  
     
      if (parsedSearchDate) {
        // 🔒 Strict date-only search
        matchFilter.date = {
          $gte: new Date(parsedSearchDate.getFullYear(), parsedSearchDate.getMonth(), parsedSearchDate.getDate(), 0, 0, 0),
          $lt: new Date(parsedSearchDate.getFullYear(), parsedSearchDate.getMonth(), parsedSearchDate.getDate() + 1, 0, 0, 0)
        };
      } else {
      matchFilter.$or = [
        { "learner.fullName": { $regex: trimmedSearch, $options: "i" } },
        { "learner.fathersName": { $regex: trimmedSearch, $options: "i" } },
        { "learner.mobileNumber": { $regex: trimmedSearch, $options: "i" } },
        { "learner.licenseNumber": { $regex: trimmedSearch, $options: "i" } },
        { "learner.llrNumber": { $regex: trimmedSearch, $options: "i" } },
        { "learner.admissionNumber": { $regex: `^\\s*${trimmedSearch}\\s*$`, $options: "i" } },
        { testType: { $regex: trimmedSearch, $options: "i" } },
        { result: { $regex: trimmedSearch, $options: "i" } },
      ];
    }
  }
    // ✅ Always Apply Date Range Filtering
    if (fromdate && todate) { 
      matchFilter.date = {
        $gte: new Date(`${fromdate}T00:00:00.000Z`),
        $lte: new Date(`${todate}T23:59:59.999Z`)
      };
    } else if (date) {
      const searchDate = new Date(`${date}T00:00:00.000Z`);
      const nextDate = new Date(searchDate.getTime() + 86400000); // +1 day
      matchFilter.date = {
        $gte: searchDate,
        $lt: nextDate,
      };
    }

  
    // ✅ If search is a valid ObjectId, filter by `learner._id`
    if (mongoose.Types.ObjectId.isValid(search)) {
      matchFilter.$or.push({ "learner._id": new mongoose.Types.ObjectId(search) });
    }

    // ✅ Get total count of filtered records (before pagination)
    const totalTestsResult = await Test.aggregate([
      {
        $lookup: {
          from: "learners",
          localField: "learnerId",
          foreignField: "_id",
          as: "learner",
        },
      },
      { $unwind: "$learner" },
      { $match: matchFilter },
      { $count: "total" },
    ]);

    const totalTests = totalTestsResult.length > 0 ? totalTestsResult[0].total : 0;
    const totalPages = paginate ? Math.ceil(totalTests / limit) : 1;

    const pipeline = [
      {
        $lookup: {
          from: "learners",
          localField: "learnerId",
          foreignField: "_id",
          as: "learner",
        },
      },
      {
        $unwind: { 
          path: "$learner", 
          preserveNullAndEmptyArrays: true // ✅ Keep documents even if no matching learner
        }
      },
      { $match: matchFilter }, // ✅ Apply filters after lookup and unwind
      { $sort: { createdAt: -1 } }, // ✅ Sort by latest createdAt
     
    ];
    
    // ✅ Conditionally exclude `learner` if `id` is provided
    if (id) {
      pipeline.push({ $project: { learner: 0 } });
    }


    // ✅ Apply pagination if applicable
    if (paginate) {
      const skip = (page - 1) * limit;
      pipeline.push({ $skip: skip }, { $limit: limit });
    }

    const tests = await Test.aggregate(pipeline);

    res.status(200).json({
      success: true,
      totalPages,
      currentPage: paginate ? page : 1,
      totalTests, // ✅ Total number of filtered records
      testsCount: tests.length,
      tests, // ✅ Current page's test records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get a single test by ID
export const getTestById = async (req, res) => {
  try {


    const test = await Test.findById(req.params.id).populate("learnerId");
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }
    res.status(200).json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching test", error: error.message });
  }
};

// Update a test by ID
export const updateTest = async (req, res) => {
  try {
    const { learnerId, testType, date, result } = req.body;
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, { learnerId, testType, date, result }, { new: true });

    if (!updatedTest) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }
    res.status(200).json({ success: true, message: "Test updated successfully", test: updatedTest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating test", error: error.message });
  }
};

// Delete a test by ID
export const deleteTest = async (req, res) => {
  try {
    const deletedTest = await Test.findByIdAndDelete(req.params.id);
    if (!deletedTest) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }
    res.status(200).json({ success: true, message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting test", error: error.message });
  }
};
