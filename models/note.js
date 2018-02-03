// require mongoose
var mongoose = require("mongoose");

// create a Schema class with mongoose
var Schema = mongoose.Schema;

// make nbaSchema a Schema
var NoteSchema = new Schema ({
    // object's ID in the array
    type: Schema.Types.ObjectId,
    // body of the note
    body: String,
});

// creates a model from the schema above, using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

// export the nbaNews model
module.exports = Note;