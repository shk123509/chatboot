const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    title:{
        type : String,
        require : true
    },
    description:{
        type : String,
        require : true
    },
    tag:{
        type : String,
        default : "General"
    },
    category: {
        type: String,
        default: "general",
        enum: ["general", "work", "personal", "important", "ideas", "meeting"]
    },
    priority: {
        type: String,
        default: "medium",
        enum: ["low", "medium", "high"]
    },
    attachments: [{
        name: String,
        size: Number,
        type: String,
        url: String
    }],
    reminder: {
        date: String,
        time: String,
        message: String,
        repeat: {
            type: String,
            default: "none",
            enum: ["none", "daily", "weekly", "monthly", "yearly"]
        },
        priority: {
            type: String,
            default: "medium",
            enum: ["low", "medium", "high"]
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("notes", NotesSchema)