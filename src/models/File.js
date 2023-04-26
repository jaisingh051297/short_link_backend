const mongoose = require("mongoose");

// Define file schema
const fileSchema = new mongoose.Schema({
    shortLink:{
        type:String,
        required:true,
    },
    originalName:{
        type:String,
    }
  },{
    timestamps:true
});
  
  // Define file model
  const File = mongoose.model("File", fileSchema);
  module.exports=File