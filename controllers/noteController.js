const { validationResult } = require('express-validator');
const Note = require('../models/Note');
const mongoose = require('mongoose');

// Tạo note mới
exports.createNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user._id;
    const { title, content, tags, category, color, isPinned } = req.body;

    const note = new Note({
      userId,
      title,
      content: content || '',
      tags: tags || [],
      category: category || 'General',
      color: color || '#ffffff',
      isPinned: isPinned || false
    });

    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (err) {
    console.error('createNote error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy danh sách notes
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      category, 
      tag, 
      search, 
      isPinned, 
      isArchived, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = { userId };

    // Filter theo category
    if (category) {
      filter.category = category;
    }

    // Filter theo tag
    if (tag) {
      filter.tags = { $in: [tag] };
    }

    // Filter theo isPinned
    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
    }

    // Filter theo isArchived
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === 'true';
    } else {
      // Mặc định không hiển thị archived notes
      filter.isArchived = false;
    }

    // Search trong title, content, tags
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    // Pinned notes luôn ở đầu
    if (sortBy !== 'isPinned') {
      sort.isPinned = -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notes = await Note.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(filter);

    res.json({
      notes,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('getNotes error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy chi tiết một note
exports.getNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Extract links từ content
    const links = note.extractLinks();

    res.json({
      note,
      links
    });
  } catch (err) {
    console.error('getNote error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cập nhật note
exports.updateNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const { title, content, tags, category, color, isPinned, isArchived } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Cập nhật các trường
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (category !== undefined) note.category = category;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;

    await note.save();

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (err) {
    console.error('updateNote error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Xóa note
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await Note.findByIdAndDelete(noteId);

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('deleteNote error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy tất cả categories
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user._id;

    const categories = await Note.distinct('category', { userId });
    
    res.json({ categories });
  } catch (err) {
    console.error('getCategories error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy tất cả tags
exports.getTags = async (req, res) => {
  try {
    const userId = req.user._id;

    const tags = await Note.distinct('tags', { userId });
    
    res.json({ tags: tags.filter(tag => tag) }); // Filter out null/empty tags
  } catch (err) {
    console.error('getTags error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Archive/Unarchive note
exports.toggleArchive = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isArchived = !note.isArchived;
    await note.save();

    res.json({
      message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      note
    });
  } catch (err) {
    console.error('toggleArchive error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pin/Unpin note
exports.togglePin = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      note
    });
  } catch (err) {
    console.error('togglePin error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
