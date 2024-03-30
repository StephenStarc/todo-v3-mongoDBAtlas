//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const app = express();
const _ = require('lodash')

app.set('view engine', 'ejs');
mongoose.set("strictQuery", false);
const password = encodeURIComponent('yQP7Pv4MAmf$ax@')
const uri = `mongodb+srv://stephenStarc:${password}@starc1.78gmq4x.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Starc1`


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function mongo(){
  await mongoose.connect(uri)

  const itemSchema = new mongoose.Schema({
    name:String
  })
   const Todo = mongoose.model('Todo', itemSchema)

   const workSchema = new mongoose.Schema({
    name:String,
    items: [itemSchema]
   })

   const List = new mongoose.model('List', workSchema)

    
   const task1 = new Todo({name:'Welcome to TO-DO list'})
   const task2 = new Todo({name:'Click + to add a new item'})
   const task3 = new Todo({name:'<-- Click this to delete Item'})
 
   const defaultArray = [task1,task2,task3]
  const day = date.getDate();
app.get("/", async function(req, res) {
 
   
   value = await Todo.find({})
 
   if(value.length == 0){
    await Todo.insertMany(defaultArray).then(() => console.log("Successfully added default task to DB")).catch((err)=>console.log('Error While adding default data to DB'))
   res.redirect('/')
  }

   res.render("list", {listTitle: day, newListItems: value});



});

app.post("/", async function(req, res){
 

  if(req.body.list === day){
    const item = req.body.newItem;
    const task4 = new Todo({name:item})
      task4.save()
      res.redirect("/");
  }else{
    console.log(req.body);
const data = await List.findOne({name:req.body.list})
    
data.items.push({name:req.body.newItem})
data.save()

    // const newlistdata = new List({name:req.body.newItem})
    // newlistdata.save()
    res.redirect("/"+req.body.list);
  }
  
});

app.post('/delete', async (req,res)=>{

  const checkID = req.body.checkbox
  console.log(req.body['list-name']);
  const listname = req.body['list-name']
  
if(listname === day){
  await Todo.findByIdAndDelete(checkID)
  res.redirect('/')
}else{
  console.log(req.body);

  const listdelete = await List.updateOne({name: listname},{
    $pull:{
      items:{_id:checkID}
    }
  })

res.redirect('/'+ listname)
}

})

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/:newList", async function(req,res){

  const captalise = _.capitalize(req.params.newList)
  const customListName = captalise


  const datain = await List.findOne({name:customListName})

  if(datain){
    datain.name == customListName && res.render('list', {listTitle: customListName, newListItems: datain.items})
  }else{
    console.log("Doesn't  exist, Creating New Collection in DB")
    const newlist = new List({
      name:customListName,
      items: defaultArray
    })
    newlist.save()
res.redirect(`/${customListName}`)
  }

  
});

app.listen(process.env.POST || 3000, function() {
  console.log("Server started on port 3000");
});

}

mongo()