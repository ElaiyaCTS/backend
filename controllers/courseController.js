import Course from '../models/CourseSchema.models.js';

// Create Course
export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// 📌 GET ALL COURSES (With Pagination & Search)
// Get All Courses with Search & Pagination
// export const getCourses = async (req, res) => {
//   try {
//     const { search, page = 1, limit = 15 } = req.query;

//     let searchFilter = {};

//     if (search) {
//       const trimmedSearch = search.trim();

//       if (!isNaN(trimmedSearch)) {
//         // If search input is a number, match numeric fields exactly
//         searchFilter.$or = [
//           { duration: parseInt(trimmedSearch) },
//           { practicalDays: parseInt(trimmedSearch) },
//           { theoryDays: parseInt(trimmedSearch) },
//           { fee: parseInt(trimmedSearch) }
//         ];
//       } else {
//         // If search input is text, use regex for courseName
//         searchFilter.courseName = { $regex: trimmedSearch, $options: "i" };
//       }
//     }

//     // Count total courses (before pagination)
//     const totalCourses = await Course.countDocuments(searchFilter);

//     // Apply pagination
//     const courses = await Course.find(searchFilter)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .lean();

//     // Count courses in the current page
//     const currentCourses = courses.length;

//     // Calculate total pages
//     const totalPages = Math.ceil(totalCourses / limit);

//     // Send response
//     res.status(200).json({
//       totalPages,
//       currentPage: parseInt(page),
//       totalCourses,
//       currentCourses,
//       courses
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };
export const getCourses = async (req, res) => {
  try {
    const { search } = req.query;
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    // If page & limit are missing, fetch all courses
    const paginate = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    let searchFilter = {};

    if (search) {
      const trimmedSearch = search.trim();

      if (!isNaN(trimmedSearch)) {
        // If search input is a number, match numeric fields exactly
        searchFilter.$or = [
          { duration: parseInt(trimmedSearch) },
          { practicalDays: parseInt(trimmedSearch) },
          { theoryDays: parseInt(trimmedSearch) },
          { fee: parseInt(trimmedSearch) }
        ];
      } else {
        // If search input is text, use regex for courseName
        searchFilter.courseName = { $regex: trimmedSearch, $options: "i" };
      }
    }

    // Count total courses (before pagination)
    const totalCourses = await Course.countDocuments(searchFilter);

    let query = Course.find(searchFilter)
    .sort({ createdAt: -1 }) // Ensure LIFO ordering
    .lean(); // Convert to plain object

    // Apply pagination only if page & limit exist
    if (paginate) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    // Fetch courses
    const courses = await query;

    // Send response
    res.status(200).json({
      totalPages: paginate ? Math.ceil(totalCourses / limit) : 1,
      currentPage: paginate ? page : 1,
      totalCourses,
      currentCourses: courses.length,
      courses,
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// Get Course by _id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params._id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Course by _id
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params._id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Course by _id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params._id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
