const express = require('express');

const router = express.Router();
const userControler = require('../controllers/userController');

router
  .route('/api/v2/users')
  .get(userControler.getAllUsers)
  .post(userControler.createUser);
router
  .route('/api/v2/users/:id')
  .get(userControler.getUser)
  .patch(userControler.updateUser)
  .delete(userControler.deleteUser);
module.exports = router;
