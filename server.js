const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("morgan");
require("dotenv").config();
const PORT = process.env.PORT || 8989;
const db = require("./models");
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout",  
{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// Get Routes
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "./public/index.html"));
});
app.get("/exercise", (req, res) =>{
    res.sendFile(path.join(__dirname, "./public/exercise.html"));
});
app.get("/stats", (req, res) =>{
    res.sendFile(path.join(__dirname, "./public/stats.html"));
});

app.put("/api/workouts/:id", ({body, params},res) => {
    const id = params.id
    db.Workout.findByIdAndUpdate(id, {$push: {exercises: body}},  { new: true, runValidators: true })
    .then(dbWorkout => {
      console.log(res)
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    })
  })

app.post("/api/workouts", (req, res) =>{
    db.Workout.create(req.body)
    .then(dbWorkout => {
        res.json(dbWorkout);
    })
    .catch(err => {
        res.json(err);
    });
});


app.get("/api/workouts", (req, res) =>{
    db.Workout.aggregate([{
      $addFields: {
         totalDuration: {$sum: "$exercises.duration"}
       } 
    }])
     .then(dbWorkout => {
        res.json(dbWorkout);
    })
    .catch(err => {
        res.json(err);
    });
});

app.get("/api/workouts/range", (req, res) =>{
    db.Workout.aggregate([{
      $addFields: {
         totalDuration: {$sum: "$exercises.duration"}
       } 
    }]).limit(7)
     .then(dbWorkout => {
        res.json(dbWorkout);
    })
    .catch(err => {
        res.json(err);
    });
});

app.listen(PORT, () => {
    console.log(`APP running on ${PORT}!`)
})