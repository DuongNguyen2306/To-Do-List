// routers/tasks.js
const express = require('express');
const router = express.Router();

// đúng đường dẫn nếu bạn đặt middlewares ở ./middlewares/auth.js
const auth = require('../middlewares/auth');
const taskController = require('../controllers/taskController');

// bảo đảm auth là function trước khi dùng
if (!auth || typeof auth !== 'function') {
  throw new Error('Auth middleware not found or not a function. Check file ../middlewares/auth.js');
}

router.use(auth); // bảo vệ tất cả route bên dưới

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for task title
 *         example: "meeting"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [To do, In progress, On approval, Done]
 *         description: Filter by task status
 *         example: "To do"
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project name
 *         example: "Work"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of tasks per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
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
router.get('/', taskController.getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
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
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Task title
 *                 example: "Complete project documentation"
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Write comprehensive API documentation"
 *               status:
 *                 type: string
 *                 enum: [To do, In progress, On approval, Done]
 *                 default: "To do"
 *                 description: Task status
 *                 example: "To do"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: "medium"
 *                 description: Task priority
 *                 example: "high"
 *               project:
 *                 type: string
 *                 description: Project name
 *                 example: "API Development"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Task tags
 *                 example: ["documentation", "api", "backend"]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *                 example: "2024-12-31T23:59:59.000Z"
 *               reminderAt:
 *                 type: string
 *                 format: date-time
 *                 description: Task reminder date
 *                 example: "2024-12-30T09:00:00.000Z"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
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
router.post('/', taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
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
 *                 description: Task title
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Updated task description"
 *               status:
 *                 type: string
 *                 enum: [To do, In progress, On approval, Done]
 *                 description: Task status
 *                 example: "In progress"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *                 example: "high"
 *               project:
 *                 type: string
 *                 description: Project name
 *                 example: "Updated Project"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Task tags
 *                 example: ["updated", "task"]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *                 example: "2024-12-31T23:59:59.000Z"
 *               reminderAt:
 *                 type: string
 *                 format: date-time
 *                 description: Task reminder date
 *                 example: "2024-12-30T09:00:00.000Z"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
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
 *       404:
 *         description: Task not found
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
router.put('/:id', taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete (archive) a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: hard
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether to permanently delete the task
 *         example: "false"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task archived"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or task already archived
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
 *         description: Task not found
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
router.delete('/:id', taskController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/hard:
 *   delete:
 *     summary: Permanently delete a task (hard delete)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Task permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task permanently deleted"
 *                 deletedTask:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     title:
 *                       type: string
 *                       example: "Deleted task title"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid task ID
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
 *         description: Task not found
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
router.delete('/:id/hard', taskController.hardDeleteTask);

/**
 * @swagger
 * /api/tasks/{id}/restore:
 *   post:
 *     summary: Restore an archived task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Task restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task restored"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Task is not archived or validation error
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
 *         description: Task not found
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
router.post('/:id/restore', taskController.restoreTask);

/**
 * @swagger
 * /api/tasks/sync:
 *   post:
 *     summary: Sync tasks (batch operations)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operations
 *             properties:
 *               operations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SyncOperation'
 *                 description: Array of sync operations
 *                 example:
 *                   - op: "create"
 *                     clientOpId: "op1"
 *                     clientId: "client_task_1"
 *                     task:
 *                       title: "New task"
 *                       description: "Task description"
 *                   - op: "update"
 *                     clientOpId: "op2"
 *                     task:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       title: "Updated task"
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
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
router.post('/sync', taskController.sync);

module.exports = router;
