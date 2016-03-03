DROP DATABASE IF EXISTS restaurants;
CREATE DATABASE restaurants;

\c restaurants;

DROP TABLE IF EXISTS restaurantsTable;

CREATE TABLE restaurantsTable (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  image VARCHAR,
  cuisine VARCHAR,
  city VARCHAR,
  state VARCHAR,
  rating INTEGER CHECK (rating < 6 AND rating > 0),
  description VARCHAR
  );

INSERT INTO restaurantsTable (name, image, cuisine, city, state, rating, description)
  VALUES
    ('Cosmos Pizza', 'italian.png', 'Italian', 'Denver', 'CO', 5, 'Best pizza hands down. No spicy-ranch bias either.'),
    ('Pho-Natic', 'pho.jpg', 'Vietnamese', 'Denver', 'CO', 3, 'Uh, pho.'),
    ('Mexico City', 'mexican.png', 'Mexican', 'Denver', 'CO', 5, 'Deep-fried steak tacos. Nuff said.'),
    ('The Elm', 'burger.png', 'American', 'Denver', 'CO', 4, 'Good burgers in Park Hill.'),
    ('Erawan Cafe', 'thai.jpg', 'Thai', 'Denver', 'CO', 4, 'Great Thai restaurant in Denver.'),
    ('Las Delicias', 'mexican.png', 'Mexican', 'Denver', 'CO', 5, 'Tops Mexican in Denver.');

DROP TABLE IF EXISTS reviewsTable;
CREATE TABLE reviewsTable (
  id SERIAL PRIMARY KEY,
  name VARCHAR (100),
  review_date DATE,
  rating INTEGER,
  review TEXT,
  restaurant_id INTEGER REFERENCES restaurantsTable(id)
);

INSERT INTO reviewsTable (name, review_date, rating, review, restaurant_id) VALUES ('Joe Schmo', 'December 12, 2015', 5, 'It''s okay I guess.', 1 ), ('Complainy McWhinesalot', 'December 24, 2015', 1, 'Ugh, they are closed. What a crappy place.', 1 ), ('Steve McQueen', 'July 4, 1975', 5, 'YEAH PIZZA!', 1 );