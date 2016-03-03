var express = require('express');
var router = express.Router();
var options = {};
var pg = require('pg');
var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/restaurants';
var db = pgp(connectionString);

// *** db routes *** //

// Route to redirect to the homepage when the endpoint /restaurants is hit
  router.get('/restaurants', function(req, res, next) {
    res.redirect('/');
  });

// Route to render the NEW restaurant page when the endpoint /restaurants/new is hit
  router.get('/restaurants/new', function(req, res, next) {
    res.render('restaurants/new', { title: 'New Restaurant' });
  });

// Route to get all of the restaurants and display on the index
  router.get('/', function(req, res, next) {

  var restArray = [];
  pg.connect(connectionString, function (err, client, done) {
    if(err) {
      done();
      return res.status(500),json({status: 'error', message: 'something went wrong'});
    }
    // query the database
    var query = client.query('SELECT * FROM restaurantsTable');
    // get all rows
    query.on('row', function(row) {
      restArray.push(row);
      done();
    });
    query.on('end', function() {
      res.render('index', { title: 'gTables', restaurantList: restArray });
      done();
    });
    pg.end();
    });
  });


// Route to display restaurant SHOW page
  router.get('/restaurants/:id', function(req, res, next) {

    db.one('SELECT * FROM restaurantsTable WHERE id=' + req.params.id)
      .then(function(data) {
        return db.any('SELECT * FROM reviewsTable WHERE restaurant_id=' + req.params.id)
        .then(function(reviews) {
          data.reviews = reviews;
          for (i in reviews) {
            reviews[i].short_review = reviews[i].review.substring(0, 35);
            reviews[i].review_date = formatDate(reviews[i].review_date);
          }
          return data;
        });
      })
      .then(function (data) {
        res.status(200)
          .render('restaurants/show',
            { title: data.name,
              singleRestaurant: data,
              reviews: data.reviews});
      })
      .catch(function(err) {
        return next(err);
      });
    });

// Route to display EDIT restaurant page
  router.get('/restaurants/:id/edit', function(req, res, next) {
    db.one('SELECT * FROM restaurantsTable WHERE id=' + req.params.id)
      .then(function (data) {
        // console.log('test-2',data.reviews);
        res.status(200)
          .render('restaurants/edit',
            {title: "Edit Restaurant",
             restaurant: data,
           });
      })
      .catch(function(err) {
        console.log('error');
        return next(err);
      });
    });

// Route to post restaurant edits
  router.post('/restaurants/:id/edit', function(req, res, next) {
    var a = req.body;
    db.none('UPDATE restaurantsTable SET name=$1, image=$2, cuisine=$3, city=$4, state=$5, rating=$6, description=$7 WHERE id=$8', [a.restname, a.image, a.cuisine, a.city, a.state, a.rating, a.description, req.params.id])
      .then(function(data) {
        console.log('test', data);
        res.status(200)
          .redirect('/');
      })
      .catch(function(err) {
        console.log('error');
        return next(err);
      });
  });

//Route to post a restaurant deletion
  router.post('/restaurants/:id/delete', function(req, res, next) {
    db.none('DELETE FROM restaurantsTable where id=' + req.params.id)
      .then(function() {
        // console.log('test', data);
        res.status(200)
          .redirect('/');
      })
      .catch(function(err) {
        console.log('error');
        return next(err);
      });
  });

//Route to post a NEW restaurant
  router.post('/restaurants', function(req, res, next) {
    var newRest = req.body;
    db.none('INSERT INTO restaurantsTable (name, image, cuisine, city, state, rating, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', [newRest.restname, newRest.image, newRest.cuisine, newRest.city, newRest.state, newRest.rating, newRest.description])
      .then(function(data) {
        res.status(200)
          .redirect('/');
      })
      .catch(function(err) {
        return next(err);
      });
  });

// Route to get and display NEW REVIEW page
  router.get('/restaurants/:id/reviews', function(req, res, next) {
      db.one('SELECT * FROM restaurantsTable WHERE id=' + req.params.id)
      .then(function (data) {
        // data.review_date = formatDate(data.review_date);
        // console.log(data.review_date);
        res.status(200)
          .render('restaurants/newreview',
            {title: "New Review",
             restaurant: data,
           });
      })
      .catch(function(err) {
        console.log('error');
        return next(err);
      });
    });

// Route to get and display EDIT REVIEW page
  router.get('/restaurants/:id/reviews/:review_id/edit', function(req, res, next) {
    db.one('SELECT * FROM reviewsTable WHERE id=' + req.params.review_id)
      .then(function (data) {
        data.review_date = formatDate(data.review_date);
        // console.log(data.review_date);
        res.status(200)
          .render('restaurants/editreview',
            {title: "Edit Review",
             review: data,
           });
      })
      .catch(function(err) {
        console.log('error');
        return next(err);
      });
    });

// Route to post review edits
  router.post('/restaurants/:id/reviews/:review_id/edit', function(req, res, next) {
    var a = req.body;
    db.none('UPDATE reviewsTable SET name=$1, review_date=$2, rating=$3, review=$4 WHERE id=$5', [a.name, a.review_date, a.rating, a.review, req.params.review_id])
      .then(function(data) {
        console.log('test', data);
        res.status(200)
          .redirect('/');
      })
      .catch(function(err) {
        console.log('error');
        return next(err);
      });
  });

//Route to post a NEW review
  router.post('/restaurants/:id/reviews', function(req, res, next) {
    var newReview = req.body;
    db.none('INSERT INTO reviewsTable (name, review_date, rating, review, restaurant_id) VALUES ($1, $2, $3, $4, $5)', [newReview.name, newReview.review_date, newReview.rating, newReview.review, req.params.id])
      .then(function(data) {
        console.log("THE DATA",data);
        res.status(200)
          .redirect('/');
      })
      .catch(function(err) {
        return next(err);
      });
  });


function formatDate(date) {
   var d = new Date(date),
       month = '' + (d.getMonth() + 1),
       day = '' + d.getDate(),
       year = d.getFullYear();
   if (month.length < 2) month = '0' + month;
   if (day.length < 2) day = '0' + day;
   return [year, month, day].join('-');
}

module.exports = router;