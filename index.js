// Require the express web application framework
require("dotenv").config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
const db = new sqlite3.Database('SisNMeDB');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
    }
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Have the logging code
app.use(express.static('public_html'));
app.use(express.urlencoded({ extended: true }));

// The default route handler '/' uses the Home_Page.html
app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public_html', 'Home_Page.html'));
});

app.post('/subscribe', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    // Insert the subscriber's data into the database
    const insertQuery = `INSERT INTO Subscribers(name, email) VALUES (?, ?)`;

    db.run(insertQuery, [name, email], function (err) {
        if (err) {
            console.error('Error inserting subscriber:', err.message);
            return res.status(500).send('Error subscribing to newsletter');
        } else {
            console.log('Subscriber added successfully');
            // Render the thankyou.ejs template with the subscriber's name and email
            res.render('thankyou', {
                title: 'Thank You!',
                name: name,
                email: email,
                context: 'newsletter'
            });
        }
    });
});

// Route handler for making reservations
app.post('/reservation', (req, res) => {
    const { firstName, surname, email, mobile, dateOfReservation, time, numberOfPeople, message } = req.body;

    // Insert the reservation data into the database
    const insertQuery = `INSERT INTO Reservations (firstName, surname, email, mobile, dateOfReservation, time, numberOfPeople, message ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(insertQuery, [firstName, surname, email, mobile, dateOfReservation, time, numberOfPeople, message], function (err) {
        if (err) {
            console.error('Error inserting reservation: ', err.message);
            return res.status(500).send('Error making reservation: ' + err.message); // Send detailed error message
        } else {
            console.log('Reservation added successfully');
            res.render('thankyou', {
                title: 'Thank You!',
                firstName: firstName,
                surname: surname,
                email: email,
                dateOfReservation: dateOfReservation,
                context: 'reservation'
            })
        }
    });
});

// Route handler for online orders
app.post('/onlineOrder', (req, res) => {
    const { firstname, lastname, email, phone, address, payment_method } = req.body;

    // Insert the online order data into the database
    const insertQuery = `INSERT INTO OnlineOrder (firstname, lastname, email, phone, address, payment_method) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(insertQuery, [firstname, lastname, email, phone, address, payment_method], function (err) {
        if (err) {
            console.error('Error inserting online order:', err.message);
            return res.status(500).send('Error placing online order');
        } else {
            console.log('Online order added successfully');

            // Send email notification
            const mailOptions = {
                from: process.env.USER,
                to: email,
                subject: 'Online Order Confirmation',
                text: `Hello ${firstname} ${lastname},\n\nYour online order has been confirmed. We will process it soon.\n\nThank you for shopping with us.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
            // Render the thankyou.ejs template with appropriate context for online order
            res.render('thankyou', {
                title: 'Thank You!',
                firstname: firstname,
                lastname: lastname,
                email: email,
                phone: phone,
                address: address,
                payment_method: payment_method,
                context: 'onlineOrder'
            });
        }
    });
});
app.get('/feedback/:type', (req, res) => {
    const feedbackType = req.params.type;

    // Check the type of feedback
    if (feedbackType === 'reservation') {
        // Handle feedback for reservations
        db.all(`SELECT * FROM Reservations`, (err, rows) => {
            if (err) {
                console.error('Error retrieving reservation data:', err.message);
                res.status(500).send('Error retrieving reservation feedback');
            } else {
                console.log('Reservation data retrieved successfully:', rows);
                res.render('feedback', { title: 'Reservation Feedback', feedbackData: rows });
            }
        });
    } else if (feedbackType === 'subscription') {
        // Handle feedback for subscriptions
        db.all(`SELECT * FROM Subscribers`, (err, rows) => {
            if (err) {
                console.error('Error retrieving subscription data:', err.message);
                res.status(500).send('Error retrieving subscription feedback');
            } else {
                console.log('Subscription data retrieved successfully:', rows);
                res.render('feedback', { title: 'Subscription Feedback', feedbackData: rows });
            }
        });
    } else if (feedbackType === 'OnlineOrder') {
        // Handle feedback for subscriptions
        db.all(`SELECT * FROM OnlineOrder`, (err, rows) => {
            if (err) {
                console.error('Error retrieving subscription data:', err.message);
                res.status(500).send('Error retrieving subscription feedback');
            } else {
                console.log('Subscription data retrieved successfully:', rows);
                res.render('feedback', { title: 'Subscription Feedback', feedbackData: rows });
            }
        });
    } else {
        // Invalid feedback type
        res.status(400).send('Invalid feedback type');
    }
});


app.use((req, res) => {
    res.status(404);
    res.render('404', { title: '404-Not Found', url: req.url });
});

app.use((error, request, response, next) => {
    let errorStatus = error.status || 500;
    response.status(errorStatus);
    response.render('error', { title: '5xx', message: '5xx - System error', error: error });
});

app.listen(port, () => {
    console.log(`Web server running at: https://localhost: ${port}`);
    console.log(`Type Ctrl+C to shut down the web server`);
});
