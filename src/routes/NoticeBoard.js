 const express = require('express');
 const { createNotice, getNotice, editNotice, deleteNotice } = require('../controllers/NoticeBoard');
 const router =express.Router();

 router.post('/createNotice', createNotice);
 router.get('/getNotice', getNotice);
 router.put('/editNotice/:id', editNotice);
 router.delete('/deleteNotice/:id', deleteNotice);

 module.exports = router;
