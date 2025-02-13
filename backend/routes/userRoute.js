const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
/**
 * @swagger
 * /newUser:
 *   post:
 *     summary: Create a new user with email, password and role.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/newUser", userController.createUser);

/**
 * @swagger
 * /userLogin:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password or role
 *       400:
 *         description: Bad request
 */
router.post("/userLogin", userController.userLogin);

/**
 * @swagger
 * /createAppointment:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disease:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *               appointmentTime:
 *                 type: string
 *               doctor:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/createAppointment", userController.createAppointment);



/**
 * @swagger
 * /deleteAppointment/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/deleteAppointment/:id', userController.deleteAppointment);

/**
 * @swagger
 * /appointments/{userId}:
 *   get:
 *     summary: Get patient's appointments by user ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       404:
 *         description: No appointments found for this user
 *       400:
 *         description: Bad request
 */
router.get('/appointments/:userId', userController.getAppointmentsByUserId);

/**
 * @swagger
 * /updateAppointment/{id}:
 *   patch:
 *     summary: Update appointment date and time
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentDate:
 *                 type: string
 *               appointmentTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       400:
 *         description: Bad request
 */
router.patch('/updateAppointment/:id', userController.updateAppointmentDate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       404:
 *         description: No users found
 *       400:
 *         description: Bad request
 */
router.get('/users', userController.getUsers);

/**
 * @swagger
 * /updateDepartment/{id}:
 *   patch:
 *     summary: Update department and image
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Department and image updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request
 */
router.patch('/updateDepartment/:id', userController.updateDepartment);

/**
 * @swagger
 * /viewDoctorAppointments:
 *   post:
 *     summary: View doctor's appointments
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Invalid user
 *       400:
 *         description: Bad request
 */
router.post("/viewDoctorAppointments", userController.doctorAppointments);

/**
 * @swagger
 * /doctorDepartment/{userId}:
 *   get:
 *     summary: Get doctor's department by user ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       404:
 *         description: No user found
 *       400:
 *         description: User is not a doctor or no department selected
 */
router.get('/doctorDepartment/:userId', userController.getDoctorDepartmentByUserId);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get users by IDs
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: userIds
 *         schema:
 *           type: string
 *         required: true
 *         description: Comma-separated user IDs
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       404:
 *         description: No users found for the provided IDs
 *       400:
 *         description: Bad request
 */
router.get('/user', userController.getUserbyId);


/**
 * @swagger
 * /deleteDoctorImage/{id}:
 *   delete:
 *     summary: Delete doctor image
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/deleteDoctorImage/:id', userController.deleteDoctorImage);

/**
 * @swagger
 * /updatePassword/{id}:
 *   patch:
 *     summary: Update password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       400:
 *         description: Bad request
 */
router.patch('/updatePassword/:id', userController.updatePassword);


/**
 * @swagger
 * /getuserIdfromEmail:
 *   post:
 *     summary: View user's id from email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User id retrieved successfully
 *       401:
 *         description: Invalid user
 *       400:
 *         description: Bad request
 */
router.post('/getuserIdfromEmail', userController.userIdfromEmail);

router.post('/checkEmailnContact', userController.checkEmailnContact);

router.get("/getLastPassword/:userId", userController.getLastPassword);

router.post('/isGoogleEmailThere', userController.isGoogleEmailThere);

router.post("/addRolenIsdoctorinGmailAccount", userController.addRolenIsdoctorinGmailAccount);

module.exports = router;