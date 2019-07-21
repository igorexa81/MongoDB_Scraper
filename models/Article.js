var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

    title: {
        type: String,
        index: {
            unique: true
        },
        required: true
    },
    // 'link' is required and of type String
    link: {
        type: String,
        required: true
    },
    // 'summary' is required and of type String
    summary: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    // 'note' is an object that stores a Note id 
    // The ref property links the ObjectID to the Note model
    // This allows us to populate the Article with an associated Note
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model 
module.exports = Article;