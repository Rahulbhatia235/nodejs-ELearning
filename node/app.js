const Client=require('pg').Client
const express=require('express')
const bodyParser=require('body-parser')


const app=express()
const users=[]
//let multer = require('multer');
//let upload = multer();
// const bodyParser=require('body-parser')
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
const client=new Client({
     user:"postgres",
     password: "1234",
     host:"localhost",
     port: 5432,
     database: "postgres"
   })
client.connect(function(err){
  if(err){
    throw err
  }

else{console.log("Connected")
}}

)
app.get('/',function(req,res){
   res.sendFile('index.html',{root: __dirname})})

app.get('/users',function(req,res)
{
  client.query("SELECT *FROM users",function(err,rows,fields){
    if(err) throw err;
    console.log("Rows are:",rows.rows)

res.render('users',{items:rows.rows})

  })

})

app.get('/register',function(req,res)
{
  res.sendFile('register.html',{root: __dirname})
})
app.post('/submit',function(req,res){
  console.log(req.body);
  //let {id,name,fname,lname,email,password,password2}=req.body;
  //console.log(id)
  console.log(req.body.userid)
  let error=[]

  if (req.body.password.length<6){
    error.push({message:'Password length should be minimum 6'})
  }
  if(req.body.password!=req.body.password2){
    error.push({message:"Password do not match!"})
  }
  if(error.length>0)
  {  res.render('register',{error})    }
  else{
    client.query(`SELECT * FROM users WHERE "Email"=$1`,[req.body.email],(err,res)=>{
      if(err) throw err;
      if(res.rows.length>0)
      {
        error.push({message:"Email Registered"})
        res.render('register',{error})
      }
      else {
        client.query(
          "INSERT INTO users values ($1,$2,$3,$4,$5,$6)",[req.body.userid,req.body.name,req.body.fname,req.body.lname,req.body.email,req.body.password],(err,res)=>{
              if(err) throw err;
          }
          )}
  })
      //res.render('users',{title:'User-Details',items:rows.rows[0]})
}
  res.render('index')
})

  //res.render('index',{message:"Data Saved Succesfully"})

//client.end()
//   res.render('index',{title:"Hey",message:"HelloThere"})
// })
//app.use(bodyParser.urlencoded({extended:false}))
app.post('/login',function(req,res){

  client.query(`SELECT "Password", "UserId" FROM users WHERE "Email"=$1`,[req.body.email],(err,row)=>{
    if(err)throw err;

    console.log(row.rows.length)

    if(row.rows.length>0){
        console.log(req.body.password)
        console.log(row.rows[0].Password)
      if(row.rows[0].Password==req.body.password){
            client.query("select * from courses",(err,rows)=>{
              if (err) throw err;
                const user={uid:row.rows[0].UserId}
                users.push(user)
                console.log(users)
                res.render('dashboard',{message:rows.rows,uid:row.rows[0].UserId})
            })

      }
      else{
        console.log("Password Dont match")
      }
    }
    else{
      console.log("No such user!!")
      res.render('index')
    }
  })
})
app.get('/enrolled',function(req,res){
  console.log(users[0].uid)
  console.log(users)
  client.query('select * from registeredcourse where "UserId"=$1',[users[0].uid],(err,row)=>{
    if (err) throw err;
  res.render('enrolled',{message:row.rows})

})
})
app.get('/dashboard',function(req,res){
  client.query("select * from courses",(err,row)=>{
    if(err) throw err;


      res.render('dashboard',{message:row.rows,uid:users[0].uid})
  })
})

app.post('/clicked', (req, res) => {
  //const click = {clickTime: new Date()};
  console.log("in clicked");
  var p=new Date()
  console.log(p)
  console.log(req.body);
  client.query("select cid from registeredcourse where cid=$1",[req.body.c],(err,result)=>{

    console.log(req.body.c)
    if(result.rows[0]!=undefined){
      console.log(req.body.c)
      console.log(result.rows[0].cid)
    if(result.rows[0].cid!=req.body.c) {

      client.query("insert into registeredcourse values ($1,$2,$3,$4)",[req.body.k,req.body.c,req.body.date,false],(err,row)=>{
      if (err) throw(err);
      res.sendStatus(201);
    })}

}
    else{
      client.query("insert into registeredcourse values ($1,$2,$3,$4)",[req.body.k,req.body.c,req.body.date,false],(err,row)=>{
      if (err) throw(err);
      res.sendStatus(201);
    })
    }
    }
  )
})

app.post('/remove', (req, res) => {
    //const click = {clickTime: new Date()};
    console.log("in remove");


    client.query("delete from registeredcourse where cid=$1",[req.body.k],(err,result)=>{


        if (err) throw(err);
        res.sendStatus(201);
      }
      )
      }
    )

app.listen(3000,()=>{
  console.log('Exampleapp is listening')});
