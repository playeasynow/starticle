let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let NoteSchema = new Schema({
  title: String,
  body: String
});

let Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
