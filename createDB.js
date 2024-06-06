let sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('SisNMeDB');


db.serialize(function () {
    // Create a table for newsletter subscriptions
    db.run(`CREATE TABLE IF NOT EXISTS Subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )`, (err) => {
        if (err) {
            console.error('Error creating newsletter subscribers table:', err.message);
        } else {
            console.log('Newsletter subscribers table created successfully');
        }
    });

    // Create a table for reservations
    db.run(`CREATE TABLE IF NOT EXISTS Reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        surname TEXT NOT NULL, 
        email TEXT NOT NULL,
        mobile TEXT NOT NULL,
        dateOfReservation TEXT NOT NULL,
        time TEXT NOT NULL,
        numberOfPeople INTEGER NOT NULL,
        message TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating reservations table:', err.message);
        } else {
            console.log('Reservations table created successfully');
        }
    });


    // Create a table for Online Order 
    db.run(`CREATE TABLE IF NOT EXISTS OnlineOrder (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        payment_method TEXT 
    )`, (err) => {
        if (err) {
            console.error('Error creating reservations table:', err.message);
        } else {
            console.log('Online Order table created successfully');
        }
    });

    console.log('Display all content from all rows of Tables in DB');
    db.each(`SELECT * FROM Subscribers`, function (err, row) {
        console.log('ID: ' + row.id + " Name: " + row.name + " Email: " + row.email);
    })
    db.each(`SELECT * FROM Reservations`, function (err, row) {
        console.log('ID: ' + row.id + " First Name: " + row.firstName + " SurName: " + row.surname +
            " Email: " + row.email + " Mobile: " + row.mobile + " Date of Reservation: " + row.dateOfReservation +
            " Time: " + row.time + " Number Of People: " + row.numberOfPeople + " Message: " + row.message);
    });
    db.each(`SELECT * FROM OnlineOrder`, function(err, row) {
        console.log('ID: ' + row.id + " First Name: " + row.firstname + " Last Name: " + row.lastname + 
            " Email: " + row.email + " Phone: " + row.phone + " Address: " + row.address + 
            " Payment Method: " + row.payment_method
        )
    })

});

db.close((err) => {
    if (err) {
        console.log('Error closing database:', err.message);
    } else {
        console.log('Database connection closed');
    }
});