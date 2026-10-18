const express = require('express');
const router  = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/userController');

// All public for now — add auth after frontend JWT is wired
router.get('/',             getAllUsers);
router.get('/:id',          getUserById);
router.put('/:id',          updateUser);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id',       deleteUser);

module.exports = router;
