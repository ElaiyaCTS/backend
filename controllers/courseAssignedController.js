import CourseAssigned from '../models/CourseAssigned.models.js';
import moment from "moment"; 
import mongoose from "mongoose";

// ✅ Create Course Assigned (statusTwo is NOT included)
 export const createCourseAssigned = async (req, res) => {
  try {
    const { learner, course, statusOne } = req.body;

    const courseAssigned = new CourseAssigned({
      learner,
      course,
      statusOne
    });

    await courseAssigned.save();
    res.status(201).json({ message: "Course assigned successfully", data: courseAssigned });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ✅ Get All Course Assignments with Search, Filters & Pagination (Including Attendance)
export const getCourseAssigned = async (req, res) => {
  try {
    const {  statusTwo, statusOne, gender } = req.query;
    const search = req.query.search?.trim() || "";
    const id = req.params.id || null;

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    const isPaginationEnabled = !isNaN(page) && page > 0 && !isNaN(limit) && limit > 0;

    const fromdate = req.query.fromdate || null;
    const todate = req.query.todate || null;
    const skip = isPaginationEnabled ? (page - 1) * limit : 0;
    
    const searchDate = moment(search, "YYYY-MM-DD", true).isValid()
      ? moment(search, "YYYY-MM-DD").toDate()
      : null;

    let matchFilter = {};

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
      }
     matchFilter["learner._id"] = new mongoose.Types.ObjectId(id);
    }

    if (search) {
      matchFilter.$or = [
        { "learner.fullName": { $regex: search, $options: "i" } },
        { "learner.fathersName": { $regex: search, $options: "i" } },
        { "learner.mobileNumber": { $regex: search, $options: "i" } },
        { "learner.licenseNumber": { $regex: search, $options: "i" } },
        { "learner.llrNumber": { $regex: search, $options: "i" } },
        { "learner.admissionNumber": { $regex: `^\\s*${search}\\s*$`, $options: "i" } },
        { "course.courseName": { $regex: search, $options: "i" } },
        { statusOne: { $regex: search, $options: "i" } },
        { statusTwo: { $regex: search, $options: "i" } },
        ...(searchDate ? [
          { createdAt: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 86400000) } },
          // { updatedAt: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 86400000) } }
        ] : [])
      ];
    } else {
      delete matchFilter.$or;
    }

    if (statusOne) matchFilter.statusOne = statusOne;
    if (statusTwo) matchFilter.statusTwo = statusTwo;
    if (gender) matchFilter["learner.gender"] = gender;

    const pipeline = [
      { $sort: { createdAt: -1 } }, 
      {
        $lookup: {
          from: "learners",
          localField: "learner",
          foreignField: "_id",
          as: "learner"
        }
      },
      { $unwind: "$learner" },

      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },

      {
        $lookup: {
          from: "learnerattendances",
          let: { learnerId: "$learner._id", courseId: "$course._id" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ["$learner", "$$learnerId"] },
                    { $eq: ["$courseType", "$$courseId"] }
                  ] 
                }
              } 
            },
            { $count: "attendedDays" }
          ],
          as: "attendance"
        }
      },

      {
        $addFields: {
          attendedDays: { $ifNull: [{ $arrayElemAt: ["$attendance.attendedDays", 0] }, 0] },
          totalDays: "$course.duration"
        }
      },

      { 
        $addFields: {
          attendanceRatio: {
            $cond: {
              if: { $gt: ["$totalDays", 0] },
              then: { $concat: [{ $toString: "$attendedDays" }, "/", { $toString: "$totalDays" }] },
              else: "0/0"
            }
          }
        }
      },

      { $match: matchFilter },

      {
        $project: {
          learner: id ? "$$REMOVE" : { _id: 1, fullName: 1, fathersName: 1, photo: 1, mobileNumber: 1, gender: 1, admissionNumber: 1, licenseNumber: 1, llrNumber: 1 },
          course: { _id: 1, courseName: 1, duration: 1 },
          statusOne: 1,
          statusTwo: 1,
          createdAt: 1,
          updatedAt: 1,
          attendedDays: 1,
          totalDays: 1,
          attendanceRatio: 1
        }
      }
    ];

    if (isPaginationEnabled) {
      pipeline.push({
        $facet: {
          metadata: [{ $count: "totalAssignments" }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      });
    }

    const result = await CourseAssigned.aggregate(pipeline);
    const totalAssignments = result[0]?.metadata?.[0]?.totalAssignments || 0;
    const assignments = isPaginationEnabled ? result[0].data : result;
    const totalPages = isPaginationEnabled ? Math.ceil(totalAssignments / limit) : 1;
    const assignmentsCount = assignments.length

    res.status(200).json({ success: true, totalPages, currentPage: isPaginationEnabled ? page : 1, totalAssignments, assignmentsCount,assignments });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Error fetching course assignments", error: error.message });
  }
};


// ✅ Get Course Assignment by ID
export const getCourseAssignedById = async (req, res) => {
  try {
    const courseAssigned = await CourseAssigned.findById(req.params._id)
      .populate('learner')
      .populate('course');

    if (!courseAssigned) return res.status(404).json({ message: 'Course Assignment not found' });

    res.status(200).json(courseAssigned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Course Assignment (Allows statusTwo)
export const updateCourseAssigned = async (req, res) => {
  try {
    const { statusOne, statusTwo } = req.body;
    const courseAssigned = await CourseAssigned.findById(req.params._id);

    if (!courseAssigned) return res.status(404).json({ message: 'Course Assignment not found' });

    if (statusOne) {courseAssigned.statusOne = statusOne; courseAssigned.statusTwo = "Ready to test";}
    if (statusTwo) {
      courseAssigned.statusOne = "Completed",
      courseAssigned.statusTwo = statusTwo; }// Only update statusTwo here

    await courseAssigned.save();
    res.status(200).json({ message: 'Course assignment updated successfully', data: courseAssigned });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Course Assignment
export const deleteCourseAssigned = async (req, res) => {
  try {
    const courseAssigned = await CourseAssigned.findByIdAndDelete(req.params._id);
    if (!courseAssigned) return res.status(404).json({ message: 'Course Assignment not found' });

    res.status(200).json({ message: 'Course Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
