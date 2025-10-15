const Task = require('../models/Task');
const mongoose = require('mongoose');

// GET tasks with basic filter/search
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q, status, project, page = 1, limit = 100 } = req.query;
    const filter = { userId };
    if (status) filter.status = status;
    if (project) filter.project = project;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(filter).sort({ dueDate: 1, priority: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Task.countDocuments(filter);
    res.json({ tasks, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getTasks error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const payload = req.body;
    payload.userId = req.user._id;
    const task = await Task.create(payload);
    res.status(201).json(task);
  } catch (err) {
    console.error('createTask error', err);
    res.status(400).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    console.error('updateTask error', err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // hard delete if query param ?hard=true
    if (req.query.hard === 'true') {
      await Task.deleteOne({ _id: taskId, userId });
      return res.json({ message: 'Task permanently deleted' });
    }

    // otherwise soft delete (archive)
    if (task.isArchived) {
      return res.status(400).json({ message: 'Task is already archived' });
    }

    task.isArchived = true;
    await task.save();

    return res.json({ message: 'Task archived', task });
  } catch (err) {
    console.error('deleteTask error', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// restore an archived task
exports.restoreTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.isArchived) {
      return res.status(400).json({ message: 'Task is not archived' });
    }

    task.isArchived = false;
    await task.save();

    return res.json({ message: 'Task restored', task });
  } catch (err) {
    console.error('restoreTask error', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// permanently delete a task (hard delete)
exports.hardDeleteTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // permanently delete from database
    await Task.deleteOne({ _id: taskId, userId });

    return res.json({ 
      message: 'Task permanently deleted',
      deletedTask: {
        id: task._id,
        title: task.title,
        deletedAt: new Date()
      }
    });
  } catch (err) {
    console.error('hardDeleteTask error', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Simple sync endpoint (batch)
exports.sync = async (req, res) => {
  try {
    const ops = req.body.operations || [];
    const userId = req.user._id;
    const results = [];
    const mappings = [];

    for (const opItem of ops) {
      const { op, clientOpId, clientId, task } = opItem;
      try {
        if (op === 'create') {
          const payload = { ...task, userId };
          delete payload._id;
          const created = await Task.create(payload);
          mappings.push({ clientId, serverId: created._id });
          results.push({ clientOpId, status: 'success', serverTask: created });
        } else if (op === 'update') {
          if (!task._id) {
            results.push({ clientOpId, status: 'error', message: 'Missing server _id' });
            continue;
          }
          const existing = await Task.findOne({ _id: task._id, userId });
          if (!existing) {
            results.push({ clientOpId, status: 'error', message: 'Task not found on server' });
            continue;
          }
          Object.assign(existing, task);
          await existing.save();
          results.push({ clientOpId, status: 'success', serverTask: existing });
        } else if (op === 'delete') {
          if (!task._id) {
            results.push({ clientOpId, status: 'error', message: 'Missing server _id' });
            continue;
          }
          const existing = await Task.findOne({ _id: task._id, userId });
          if (!existing) {
            results.push({ clientOpId, status: 'error', message: 'Task not found' });
            continue;
          }
          existing.isArchived = true;
          await existing.save();
          results.push({ clientOpId, status: 'success', serverTask: existing });
        } else {
          results.push({ clientOpId, status: 'error', message: 'Unknown op' });
        }
      } catch (opErr) {
        console.error('sync op error', opErr);
        results.push({ clientOpId, status: 'error', message: opErr.message });
      }
    }

    res.json({ results, mappings });
  } catch (err) {
    console.error('sync error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
