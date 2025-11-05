const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middlewares/auth');
const noteController = require('../controllers/noteController');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
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
 *                 description: Note title
 *                 example: "Useful Links"
 *               content:
 *                 type: string
 *                 description: Note content (can contain text and links)
 *                 example: "Check out this link: https://example.com"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorization
 *                 example: ["links", "resources", "web"]
 *               category:
 *                 type: string
 *                 description: Category name
 *                 example: "Web Development"
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 description: Note color in hex format
 *                 example: "#FF5733"
 *               isPinned:
 *                 type: boolean
 *                 description: Whether note is pinned
 *                 example: false
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note created successfully"
 *                 note:
 *                   $ref: '#/components/schemas/Note'
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
  body('content').optional().isString().withMessage('Content must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean')
], noteController.createNote);

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes for the authenticated user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: "Web Development"
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *         example: "links"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and tags
 *         example: "react"
 *       - in: query
 *         name: isPinned
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by pinned status
 *         example: "true"
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by archived status
 *         example: "false"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *         description: Sort field
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 50
 *                 totalPages:
 *                   type: integer
 *                   example: 2
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
router.get('/', noteController.getNotes);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a specific note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *                 links:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Extracted links from content
 *                   example: ["https://example.com"]
 *       400:
 *         description: Invalid note ID
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
 *         description: Note not found
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
router.get('/:id', noteController.getNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
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
 *                 description: Note title
 *                 example: "Updated title"
 *               content:
 *                 type: string
 *                 description: Note content
 *                 example: "Updated content with link: https://example.com"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags
 *                 example: ["updated", "links"]
 *               category:
 *                 type: string
 *                 description: Category
 *                 example: "Updated Category"
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 description: Note color
 *                 example: "#33FF57"
 *               isPinned:
 *                 type: boolean
 *                 description: Whether note is pinned
 *                 example: true
 *               isArchived:
 *                 type: boolean
 *                 description: Whether note is archived
 *                 example: false
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note updated successfully"
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error or invalid note ID
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
 *         description: Note not found
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
  body('content').optional().isString().withMessage('Content must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
  body('isArchived').optional().isBoolean().withMessage('isArchived must be a boolean')
], noteController.updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note deleted successfully"
 *       400:
 *         description: Invalid note ID
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
 *         description: Note not found
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
router.delete('/:id', noteController.deleteNote);

/**
 * @swagger
 * /api/notes/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["General", "Web Development", "Resources"]
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
router.get('/categories/list', noteController.getCategories);

/**
 * @swagger
 * /api/notes/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["links", "resources", "web", "react"]
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
router.get('/tags/list', noteController.getTags);

/**
 * @swagger
 * /api/notes/{id}/archive:
 *   post:
 *     summary: Archive or unarchive a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Note archive status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note archived successfully"
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid note ID
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
 *         description: Note not found
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
router.post('/:id/archive', noteController.toggleArchive);

/**
 * @swagger
 * /api/notes/{id}/pin:
 *   post:
 *     summary: Pin or unpin a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Note pin status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Note pinned successfully"
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid note ID
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
 *         description: Note not found
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
router.post('/:id/pin', noteController.togglePin);

module.exports = router;
