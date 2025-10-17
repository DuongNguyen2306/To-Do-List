const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middlewares/auth');
const monthlyGoalController = require('../controllers/monthlyGoalController');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @swagger
 * /api/monthly-goals:
 *   post:
 *     summary: Create a new monthly goal
 *     tags: [Monthly Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dailyTime
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Goal title
 *                 example: "Tập gym mỗi ngày"
 *               description:
 *                 type: string
 *                 description: Goal description
 *                 example: "Tập gym để giữ sức khỏe"
 *               dailyTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                 description: Daily time in HH:MM format
 *                 example: "06:00"
 *               timezone:
 *                 type: string
 *                 description: User timezone
 *                 example: "Asia/Ho_Chi_Minh"
 *               repeatConfig:
 *                 type: object
 *                 properties:
 *                   weekdays:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                     description: Days of week (0=Sunday, 6=Saturday)
 *                     example: [1, 2, 3, 4, 5]
 *                   includeWeekends:
 *                     type: boolean
 *                     description: Include weekends
 *                     example: false
 *     responses:
 *       201:
 *         description: Monthly goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monthly goal created successfully"
 *                 goal:
 *                   $ref: '#/components/schemas/MonthlyGoal'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', [
  body('title').isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
  body('dailyTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Daily time must be in HH:MM format'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('repeatConfig.weekdays').optional().isArray().withMessage('Weekdays must be an array'),
  body('repeatConfig.includeWeekends').optional().isBoolean().withMessage('Include weekends must be a boolean')
], monthlyGoalController.createMonthlyGoal);

/**
 * @swagger
 * /api/monthly-goals:
 *   get:
 *     summary: Get all monthly goals for the authenticated user
 *     tags: [Monthly Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, completed, cancelled]
 *         description: Filter by goal status
 *         example: "active"
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month (1-12)
 *         example: 10
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *         example: 2024
 *     responses:
 *       200:
 *         description: Monthly goals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goals:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MonthlyGoal'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', monthlyGoalController.getMonthlyGoals);

/**
 * @swagger
 * /api/monthly-goals/{id}:
 *   get:
 *     summary: Get a specific monthly goal with tasks and progress
 *     tags: [Monthly Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monthly goal ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Monthly goal retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goal:
 *                   $ref: '#/components/schemas/MonthlyGoal'
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 progress:
 *                   type: object
 *                   properties:
 *                     completed:
 *                       type: integer
 *                       example: 15
 *                     total:
 *                       type: integer
 *                       example: 30
 *                     rate:
 *                       type: integer
 *                       example: 50
 *       400:
 *         description: Invalid goal ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Monthly goal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', monthlyGoalController.getMonthlyGoal);

/**
 * @swagger
 * /api/monthly-goals/{id}:
 *   put:
 *     summary: Update a monthly goal
 *     tags: [Monthly Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monthly goal ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Goal title
 *                 example: "Updated goal title"
 *               description:
 *                 type: string
 *                 description: Goal description
 *                 example: "Updated goal description"
 *               dailyTime:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                 description: Daily time in HH:MM format
 *                 example: "07:00"
 *               timezone:
 *                 type: string
 *                 description: User timezone
 *                 example: "Asia/Ho_Chi_Minh"
 *               repeatConfig:
 *                 type: object
 *                 properties:
 *                   weekdays:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                     description: Days of week (0=Sunday, 6=Saturday)
 *                     example: [1, 2, 3, 4, 5, 6, 0]
 *                   includeWeekends:
 *                     type: boolean
 *                     description: Include weekends
 *                     example: true
 *               status:
 *                 type: string
 *                 enum: [active, paused, completed, cancelled]
 *                 description: Goal status
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Monthly goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monthly goal updated successfully"
 *                 goal:
 *                   $ref: '#/components/schemas/MonthlyGoal'
 *       400:
 *         description: Validation error or invalid goal ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Monthly goal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', [
  body('title').optional().isLength({ min: 1, max: 255 }).withMessage('Title must be less than 255 characters'),
  body('dailyTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Daily time must be in HH:MM format'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('status').optional().isIn(['active', 'paused', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('repeatConfig.weekdays').optional().isArray().withMessage('Weekdays must be an array'),
  body('repeatConfig.includeWeekends').optional().isBoolean().withMessage('Include weekends must be a boolean')
], monthlyGoalController.updateMonthlyGoal);

/**
 * @swagger
 * /api/monthly-goals/{id}:
 *   delete:
 *     summary: Delete a monthly goal
 *     tags: [Monthly Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Monthly goal ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Monthly goal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Monthly goal deleted successfully"
 *       400:
 *         description: Invalid goal ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Monthly goal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', monthlyGoalController.deleteMonthlyGoal);

/**
 * @swagger
 * /api/monthly-goals/progress/report:
 *   get:
 *     summary: Get progress report for monthly goals
 *     tags: [Monthly Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *         example: 10
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *         example: 2024
 *     responses:
 *       200:
 *         description: Progress report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: integer
 *                   example: 10
 *                 year:
 *                   type: integer
 *                   example: 2024
 *                 totalGoals:
 *                   type: integer
 *                   example: 3
 *                 activeGoals:
 *                   type: integer
 *                   example: 2
 *                 totalTasks:
 *                   type: integer
 *                   example: 45
 *                 goals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         example: "Tập gym mỗi ngày"
 *                       completedDays:
 *                         type: integer
 *                         example: 15
 *                       totalDays:
 *                         type: integer
 *                         example: 30
 *                       completionRate:
 *                         type: integer
 *                         example: 50
 *                       status:
 *                         type: string
 *                         example: "active"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/progress/report', monthlyGoalController.getProgressReport);

module.exports = router;
