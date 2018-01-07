var express= require("express"),
    app = express(),
    bodyParser= require("body-parser"),
    mongoose=require("mongoose"),
    multer= require("multer"),
    fileUpload= require("express-fileupload"),
    methodOverride= require("method-override"),
    json2csv= require("json2csv"),
    csv= require("fast-csv");
    
var Employee= require("./models/employee");

mongoose.connect("mongodb://localhost/apiria");
mongoose.Promise= global.Promise;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(fileUpload());


//File Upload
// var storage= multer.diskStorage({
//   //  gfs:gfs,
//     destination: function(req, file, callback){
//       callback(null, "./upload/");  
//     },
//   filename: function(req, file, callback){
//       callback(null,file.fieldname +"-" + Date.now()+ "." + file.orignalname.split('.')[file.originalname.split('.').length -1]);
//   },
//   metadata: function(req, file, callback){
//       callback(null, {orignalname: file.orignalname});
//   },
//   root: "ctfiles"
// });
// function excelFilter(req, file, callback){
//     //excel upload file only
//     if(!file.orignalname.match(/\.(xls|xlxs)$/i)){
//         return callback(new Error('Only excel files are allowed!'), false);
//     }
//     callback(null, true);
// }
//var upload=multer({storage: storage, fileFilter: excelFilter}).single("file");

app.get("/upload", function(req, res){
   res.render("home"); 
});
app.post("/upload", function(req, res){
    
if (!req.files)
        return res.status(400).send('No files were uploaded.');
        var employeeFile = req.files.file;
 
    var employee = [];
         console.log(employeeFile);
    csv
     .fromString(employeeFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
          
         employee.push(data);
     })
     .on("end", function(){
         Employee.create(employee, function(err, documents) {
            if (err) {throw err;}
            console.log(employee);
         });
         res.send(employee.length + ' employees have been successfully uploaded.');
     });
});
app.get("/upload/employee", function(req, res){
    Employee.find({},function(err, employees){
        if(err){
            console.log(err);
        } else {
            res.render("employee",{employees:employees});
        }
    });
});
app.get("/upload/employee/:id/edit", function(req, res) {
    Employee.findById(req.params.id, function(err, employee){
        if(err){
            console.log(err);
            res.redirect("/upload/employee");
        } else {
            res.render("edit",{employee:employee});
        }
    });
});
app.put("/upload/employee/:id", function(req, res){
    Employee.findByIdAndUpdate(req.params.id , req.body.employee ,function(err, updateData){
       if(err){
          console.log(err);
          res.redirect("/upload/employee");
       } else {
           res.redirect("/upload/employee");
       }
    });
});
app.delete("/upload/employee/:id", function(req, res){
   Employee.findByIdAndRemove(req.params.id, function(err){
     if(err){
         console.log(err);
         res.redirect("/upload/employee");
     }  else {
         res.redirect("/upload/employee");
     }
   });
});
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Process Started!!");
});