const express = require("express");
const router = express.Router();
const {
  createProgram,
    getAllPrograms,
    getProgramById,
    updateProgramById,
    deleteProgramById,
    getProgramsByDepartment
} = require("../controllers/program.controller");

const authorizeRole = require("../middlewares/authorizeRole");
const { authenticate } = require("../middlewares/authMiddleware");
const userRoles = require("../utils/role");
const { programValidator } = require("../validators/program.validator.js");
// Routes
router
    .route("/")
    .post(
        authenticate,
        authorizeRole([userRoles.ADMIN]),
        programValidator,
        createProgram
    )
    .get(getAllPrograms);
router
    .route("/:id")  
    .get(getProgramById)
    .put(
        authenticate,
        authorizeRole([userRoles.ADMIN]),       
        // programValidator,
        updateProgramById
    )
    .delete(    
        authenticate,
        authorizeRole([userRoles.ADMIN]),
        deleteProgramById
    );

router.get('/programs/:departmentId', getProgramsByDepartment);

module.exports = router;
