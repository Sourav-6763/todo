const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Event = require("../models/event");

//!add new todo
router.post("/addtodo/:id", async (req, res) => {
  const userId = req.params.id;
  const { title, description, createdate } = req.body;

  try {
    // Find the user by ID
    const existingUser = await User.findById(userId);

    // Check if the user exists
    if (!existingUser) {
      return res.status(200).json({ message: "User not found" });
    }

    // Create and save the new event
    const newEvent = new Event({ title, description, createdate });
    await newEvent.save();

    // Add the new event to the user's todo list
    existingUser.todo.push(newEvent);
    await existingUser.save();

    // Respond with the new event
    return res.status(200).json({ message: "Successfully added" });
  } catch (err) {
    // Respond with an error message
    return res.status(200).json({ message: "User not found" });
  }
});

//! show all todo
router.get("/show/:id", async (req, res) => {
  try {
    let data = await User.findById(req.params.id).populate("todo").sort({
      createdate: -1,
    });
    if (!data) {
      return res.status(200).json({ message: "nothing posts by the user" });
    }

    // Respond with the user data including todos
    return res.status(200).json({ data: data.todo });
  } catch (err) {
    res.status(200).json({ message: "error " });
  }
});

//!update todo index
router.put("/update/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let userexists = await Event.findById(id);

    if (!userexists) {
      return res.status(200).json({ message: "data not exist" });
    }
    let editdata = await Event.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        description: req.body.description,
      },
      { new: true }
    );
    await editdata
      .save()
      .then(() => res.status(200).json({ message: "data is updated" }));
  } catch (err) {
    res.status(200).json(err.message);
  }
});

//!delete todo index
router.delete("/delete/:id", async (req, res) => {
  const { id: todoId } = req.params; // Use the id from the params as todoId
  const { listid: userId } = req.body; // Ensure userId is received from the request body
  try {
    // Attempt to delete the todo item from the Event collection
    const deletedTodo = await Event.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      return res.status(200).json({ message: "Todo not found" });
    }

    // Attempt to update the user by pulling the deleted todoId from their todo list
    const existingUser = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { todo: todoId } },
      { new: true } // Return the updated user document if needed
    );

    // if (!existingUser) {
    //   return res.status(200).json({ message: "User not found" });
    // }

    // Send success response
    res
      .status(200)
      .json({ message: "Event is deleted", updatedUser: existingUser });
  } catch (err) {
    // Send error response with a 500 status
    res.status(200).json({ error: err.message });
  }
});

//!edit
router.get("/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let userexists = await Event.findById(id);
    console.log(userexists);
    if (!userexists) {
      return res.status(200).json({ message: "data not exist" });
    }
    res.status(200).json({ data: userexists });
  } catch (err) {
    res.status(200).json(err.message);
  }
});

module.exports = router;