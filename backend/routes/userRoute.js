const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/newUser", userController.createUser);

// router.get("/fetchData/:id", userController.getUserById);

router.post("/createAppointment", userController.createAppointment);

router.post("/userLogin", userController.userLogin);

router.delete('/deleteAppointment/:id', userController.deleteAppointment);

// router.get('/getAppointments', userController.getAppointments);

router.get('/appointments/:userId', userController.getAppointmentsByUserId);

router.patch('/updateAppointment/:id', userController.updateAppointmentDate);

module.exports = router;