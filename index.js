
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const https = require("https");


const homeStartingContent = "Welcome to our tech blog, where we explore the ever-evolving world of open-source programs and technologies! In this digital era, open-source software has emerged as a powerful force, empowering individuals, organizations, and communities to collaborate, innovate, and shape the future of technology. Through this blog, we aim to dive into the exciting realm of open-source programs, shedding light on the latest trends, sharing valuable insights, and uncovering hidden gems that can revolutionize the way we work, create, and interact with technology. Whether you're a seasoned developer, an aspiring technologist, or simply curious about the possibilities of open-source, join us on this journey as we unravel the captivating world of tech and open source, one post at a time.";
const aboutContent = "At ByteDot, we are passionate about harnessing the power of open-source technology to drive innovation and create a positive impact. With a deep understanding of the transformative potential of open-source programs, we are committed to providing our readers with valuable resources, insights, and guidance. Our mission is to demystify the world of tech and open source, making it accessible to everyone, regardless of their background or expertise. Whether you're a student, a professional, or an enthusiast, our about page is your gateway to discovering new possibilities, staying updated with the latest trends, and unlocking the vast potential that open source has to offer. Join us on this exciting journey as we explore the intersection of technology and open-source, empowering you to embrace the future with confidence and creativity.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const PORT = process.env.PORT || 3000;
const app = express();
//const uri = "mongodb+srv://" + MYUSER + ":" + MYPASS + "@abdallah.qb7z6xt.mongodb.net/blogDB?retryWrites=true&w=majority";
 
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
//creating new database
const connectDB = async ()=>{
  const conn = mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
}
 
const postSchema = {
  title: String,
  content: String,
};
 
const Post = mongoose.model("Post", postSchema);
 
app.get("/", async function (req, res) {
  const foundPosts = await Post.find();
  res.render("home", { startingContent: homeStartingContent, posts: foundPosts });
});
 
app.get("/about", (req, res) => {
  res.render("about", { aboutContent: aboutContent });
});
 
app.get("/contact", (req, res) => {
  res.sendFile(__dirname+"/signup.html");
});
app.post("/contact", (req,res)=>{
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.Email;
  const data ={
      members:[
          {
              "email_address":email,
              "status" : "subscribed",
              "merge_fields": {
                  "FNAME":firstName,
                  "LNAME": lastName
              },
              
          }
      ]
  };
  const jsonData = JSON.stringify(data);

  const url = "https://us21.api.mailchimp.com/3.0/lists/28c6d4c66f";
  const options = {
      method:"POST",
      auth:"manas1:5a08cf69e5772dee623b4365e4c028e5-us21"
  }
  const request = https.request(url,options,function(response){
      if(response.statusCode === 200){
          res.sendFile(__dirname+"/success.html");
      }
      else{
          res.sendFile(__dirname+"/failure.html");
      }
      response.on("data", function(data){
          console.log(JSON.parse(data));
      })
  });
  request.write(jsonData);
  request.end();
});

app.post("/failure",(req,res)=>{
  res.redirect("/");
})
 
app.get("/compose", (req, res) => {
  res.render("compose");
});
 

app.post("/compose", async function (req, res) {
  try {
    const post = new Post({
      title: _.capitalize(req.body.postTitle),
      content: req.body.postBody,
    });
    
    await post.save();
    console.log("Post added to DB succesfully");
    res.redirect("/");
    
  } catch (err) {
    console.log("Failed to add post to DB succesfully xD");
  }
});
 
app.get("/posts/:postId", async function(req, res){
  const reqPostId = req.params.postId;
 
  const post = await Post.findOne({ _id: reqPostId });
  res.render("post", { title: _.capitalize(post.title), content:(post.content) });

});
 
connectDB().then(()=>{
  app.listen(PORT, function() {
    console.log(`Server started on port ${PORT}`);
  });
})







