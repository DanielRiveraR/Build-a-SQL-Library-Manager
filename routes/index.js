const express = require('express');
const Book = require('../models').Book;
const router = express.Router();
const Sequelize = require('sequelize');


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req,res,next) => {
    try {
      await cb(req,res,next)
    } catch(error) {
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', (req, res) =>{
  res.redirect('/books');
});

/* GET books page. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  res.render('index', {books});
}));

/* GET New books page. */
router.get('/books/new', (req, res) =>{
  res.render('new-book', { title: 'New Book', book: {} });
});

/*POST New books page. */
router.post('/books/new', asyncHandler(async(req, res) =>{
  try{
    const book = await Book.create(req.body);
    res.redirect('/');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const book = await Book.build(req.body);
      res.render('new-book', { title: 'New Book', book, errors: error.errors});
    } else {
      throw error;
    }
  }
}));

/* GET Book detail form. */
router.get('/books/:id', asyncHandler(async (req, res, next) => { 
  const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('update-book', { title: book.title, book});
    } else {
      const error = new Error();
      error.status = 404;
      error.message = 'Sorry, the book you are requesting is not available in our database.';
      next(error);
    }
}));

/*POST Updates book info detail form. */
router.post('/books/:id', asyncHandler(async(req, res) => {
  try{
    const book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect("/" + book.id);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { title: 'Update Book', book, errors: error.errors});
    } else {
      throw error;
    }
  }
}));

/*POST Delete a book. */
router.post('/books/:id/delete', asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  try{
    await book.destroy();
    res.redirect('/');
  } catch (error) {
    throw error;
  }
}));

/*404 error handler */
router.use((req, res, next) => {
  const error = new Error();
  error.status = 404;
  error.message = 'Sorry, the page you are requesting does not exist.';
  console.log(error.status, error.message);
  res.status(404).render('page-not-found', { error });
  next(error);
});

/*Global error handler */
router.use((error, req, res, next) => {
  if (error) {
    console.log('Global error called', error);
  }
  if (error.status === 404) {
    res.status(404).render('page-not-found', { error });
  } else {
  error.status = 500;
  error.message = 'Oops!, It looks like something went wrong on the server.';
  console.log(error.message, error.status);
  res.status(500).render('error', { error });
  }
});

module.exports = router;
