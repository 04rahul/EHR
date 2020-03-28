const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
var session = require('express-session')
var nodemailer = require('nodemailer');
const driver = require('bigchaindb-driver')
var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var http = require('http');
var formidable = require('formidable');
const API_PATH = 'http://localhost:9984/api/v1/'
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const bdb = require('easy-bigchain')
const conn = new driver.Connection(API_PATH)
const alice = bdb.generateKeypair('alice')


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}




var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({secret: 'ssshhhhh',
		resave: false,
  		saveUninitialized: true,}));







function generateOTP() { 
          
    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 4; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP; 
} 

async function getAsset()
{
        var asset = await conn.searchAssets('ford')
        console.log(asset[0])
        var transaction = await conn.getTransaction(asset[0].id)
        console.log(transaction)


        const txTransferBob = driver.Transaction.makeTransferTransaction(

                [{ tx: transaction, output_index: 0 }],
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey))],
                {price: '100 euro'}
        )
        
        // Sign with alice's private key
        let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
        console.log('Posting signed transaction: ', txTransferBobSigned)
        
        // Post with commit so transaction is validated and included in a block
        transfer = await conn.postTransactionCommit(txTransferBobSigned)
        console.log(transfer.id)

}



app.use(express.static(path.join('/home/rd/project/images')));
app.set('view engine', 'ejs');
//start of main
app.get('/',function(req,res){

  res.sendFile('/home/rd/project/split-landing-page/dist/SampleScroll.html');

});
//end of main


//doctor start
app.get('/doctor',function(req,res)
{
res.sendFile(path.join('/home/rd/project/day-001-login-form/dist/docsignfinal.html'));
}
);
// doc end

//patient start
app.get('/paitent',function(req,res)
{
res.sendFile(path.join('/home/rd/project/day-001-login-form/dist/patientsignfinal.html'));
}
);
//patient end


//psignup start
app.post('/psignup',function(req,res)
{

req.session.fname=req.body.fname;
req.session.lname=req.body.lname;
req.session.email=req.body.email;
req.session.pass=req.body.pass;
req.session.dob=req.body.dob;
req.session.gen=req.body.gen;
req.session.phone=req.body.phone;
var emailtext= generateOTP() ;
console.log(emailtext); 
req.session.otp=emailtext;
var email=req.body.email;
console.log(email);
var mailOptions = {
  from: 'rahuldoshi34@gmail.com',
  to: email,
  subject: 'Sending Email using Node.js',
  text: emailtext
};
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);  }
});
res.sendFile(path.join('/home/rd/project/otp.html'));
});
//psignup end

//signup for doctor save the data into session
app.post('/dsignup',function(req,res)
{
req.session.fname=req.body.fname;
req.session.lname=req.body.lname;
req.session.email=req.body.email;
req.session.pass=req.body.pass;
req.session.phone=req.body.phone;
var emailtext= generateOTP() ;
console.log(emailtext); 
req.session.otp=emailtext;
var email=req.body.email;
console.log(email);
var mailOptions = {
  from: 'rahuldoshi34@gmail.com',
  to: email,
  subject: 'Sending Email using Node.js',
  text: emailtext
};
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);  }
});
res.sendFile(path.join('/home/rd/project/otp.html'));
// send user to the otp page

});
//end of /dsignup


//when clciked submit in otp page
app.post('/otp',function(req,res)
{
console.log(req.session.lname);
if(req.body.uotp=req.session.otp)
{
var fn=encrypt(req.session.fname);

console.log(fn);

var ln=encrypt(req.session.lname);
console.log(ln);
var email=encrypt(req.session.email);
console.log(email);
var pass=encrypt(req.session.pass);
console.log(pass);
var phone=encrypt(req.session.phone);

console.log(ln);
console.log(phone);

if(req.session.dob==null)
{

res.sendFile(path.join('/home/rd/project/DoctorDetails.html'));
}
else
{
console.log(req.session.dob);

var dob=encrypt(req.session.dob);

var gen=encrypt(req.session.gen);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("project");
  var myobj = { fname: fn, lname: ln , email:email ,password:pass ,phone:phone ,dob:dob, gen:gen};
  dbo.collection("psignup").insertOne(myobj, function(err, res) {
    if (err) throw err
    console.log("1 document inserted");
    db.close();
  });
});
}
}
else
{
console.log(req.body.uotp);
console.log(req.session.otp);
}



}
);


app.post('/plogin',function(req,res)
{

req.session.email=encrypt(req.body.email);
const key = bdb.generateKeypair(req.session.email);
req.session.key=key;
console.log(req.session.key);
var e=req.body.email;
console.log(e);
var email=e;
var pass=encrypt(req.body.pass);
console.log(email);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("project");
console.log(email);

  //Find the first document in the customers collection:
  dbo.collection("psignup").findOne({email:email}, function(err, resu) {
    if (err) throw err;
	if (email==resu.email && pass==resu.password)
	
{

console.log("hello");
res.render('/home/rd/project/latestpatientprof1/patientaddrec.ejs',{'email':decrypt(req.session.email)});





}
    else
{
  console.log("not okay");
} 
 
 db.close();

});
 });

}
);



app.post('/dlogin',function(req,res)
{
var email=encrypt(req.body.email);
var pass=encrypt(req.body.pass);
console.log(email);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("project");
  //Find the first document in the customers collection:
  dbo.collection("dsignup").findOne({email:email}, function(err, result) {
    if (err) throw err;
console.log(result);
	if (email==result.email && pass==result.password)
{
res.sendFile('/home/rd/project/latestpatientprof1/patientaddrec.html');
console.log("hello");


}
    else
{
  console.log("not okay");
} 
  });
 db.close();
});


res.sendFile(path.join('/home/rd/project/DoctorDetails.html'));
}
);



app.post('/dsave',function(req,res)
{
var fn=req.session.fname;

var uni=req.body.uni;
console.log(uni);
var spl=req.body.spl;
console.log(spl);
var wh1=req.body.wh1;
console.log(wh1);
var wh=req.body.wh;
console.log(wh);
var we=req.body.we;
console.log(we);
var gen=req.body.gender;
console.log(gen);
var cw=req.body.cw;
console.log(cw);
var qual=req.body.qual;
console.log(qual);
var ca=req.body.ca;
console.log(ca);


var ln=req.session.lname;

var email=encrypt(req.session.email);

var pass=encrypt(req.session.pass);

var phone=encrypt(req.session.phone);
const keys = new driver.Ed25519Keypair()
var epublic=encrypt(keys.publicKey);
var eprivate=encrypt(keys.privateKey);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("project");
  var myobj = { fname: fn, lname: ln , email:email ,password:pass ,phone:phone ,cw:cw, gen:gen,uni:uni,spl:spl,qual:qual,ca:ca,pubkey:epublic,privkey:eprivate};
  dbo.collection("dsignup").insertOne(myobj, function(err, res) {
    if (err) throw err
    console.log("1 document inserted");

dbo.collection('dsignup').find({}).toArray(function(err, result) {
if (err) throw err;
   
console.log(result);

res.render('/home/rd/project/patientprofile.ejs',{'docs':result});




    db.close();
  });
});

}
);

}
);
app.get('/patientdoclist',function(req,res)
{
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
var db1=db.db("project");
db1.collection('dsignup').find({}).toArray(function(err, result) {
if (err) throw err;
 res.render('/home/rd/project/latestpatientprof1/patientdoclist.ejs',{'docs':result,'email':decrypt(req.session.email)});
  

})


});
app.get('/patientmedhistory',function(req,res)
{
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("bigchain");
  //Find the first document in the customers collection:
  dbo.collection("assets").find({"data.email":req.session.email}).toArray( function(err, result) {
    if (err) throw err;
/*
console.log(result.length);
for(var i=0;i<result.length;i++)
{
    console.log(result[i].data.description);
}
console.log(decrypt(result[0].data.file));
*/
console.log(result);
console.log(decrypt(req.session.email));
res.render('/home/rd/project/latestpatientprof1/patientmedhistory.ejs',{'doc':result,'email':decrypt(req.session.email)});

    db.close();
});
//res.sendFile(path.join('/home/rd/project/latestpatientprof1/patientmedhistory.ejs');
});


});
app.post('/access',function(req,res)
{
console.log(req.body.value);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("bigchain");
  //Find the first document in the customers collection:
  dbo.collection("assets").find({"data.email":req.session.email}).toArray( function(err, result) {
    if (err) throw err;
/*
console.log(result.length);
for(var i=0;i<result.length;i++)
{
    console.log(result[i].data.description);
}
console.log(decrypt(result[0].data.file));
*/
console.log(result);
res.render('/home/rd/project/latestpatientprof1/patientaccesstrans.ejs',{'doc':result,'email':decrypt(req.session.email)});

    db.close();
});

});
//res.sendFile(path.join('/home/rd/project/latestpatientprof1/patientaccesstrans.html'));
})

 
})



app.post('/logout',function(req,res)
{
req.session.destroy();
 res.sendFile(path.join('/home/rd/project/split-landing-page/dist/SampleScroll.html'));
})

app.post('/submitrec',function(req,res)
{
console.log(req.body.d);
new formidable.IncomingForm().parse(req, (err, fields, files) => {
 console.log("hello");
    if (err) {
      console.error('Error', err)
      throw err
    }
   console.log("heyy");
 var fpath=files.fileupload.path; 
console.log(fpath);
console.log(fields.d); 


 


//Reading file from computer
let testFile = fs.readFileSync(fpath);
//Creating buffer for ipfs function to add file to the system
let testBuffer = new Buffer(testFile);

//Addfile router for adding file a local file to the IPFS network without any local node

    ipfs.files.add(testBuffer, function (err, filee) {
        if (err) {
          console.log(err);
        }
        console.log(filee[0].hash);
var a=encrypt(filee[0].hash);



const assetdata = {
         
                'email':req.session.email,
		'file':a,
        	'description':fields.d,
}

// Metadata contains information about the transaction itself
// (can be `null` if not needed)
// E.g. the bicycle is fabricated on earth
const metadata = {
'datetime': new Date().toString()

}

// Construct a transaction payload
const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
        assetdata,
        metadata,

        // A transaction needs an output
        [ driver.Transaction.makeOutput(
                        driver.Transaction.makeEd25519Condition(req.session.key.publicKey))
        ],
        req.session.key.publicKey
)

// Sign the transaction with private keys of Alice to fulfill it
const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, req.session.key.privateKey)

// Send the transaction off to BigchainDB
const conn = new driver.Connection(API_PATH)

conn.postTransactionCommit(txCreateAliceSimpleSigned)
        .then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))
        // With the postTransactionCommit if the response is correct, then the transaction
        // is valid and commited to a block

}); 
});
});
app.get('/patientaddrec',function(req,res)
{
res.render('/home/rd/project/latestpatientprof1/patientaddrec.ejs',{'email':decrypt(req.session.email)});
})
app.post('/view',function(req,res)
{
console.log(decrypt(req.body.b));



var url='https://ipfs.io/ipfs/'
var url1=decrypt(req.body.b);
var url2=url+url1;
res.redirect(url2);

})
app.post('/check',function(req,res)
{
console.log("RES: "+res);
var count= Object.keys(req.body).length;
console.log(count);
console.log("REQ-BODY: "+req.body);
for(i=0;i<count;i++)
{
if(req.body[i]==undefined)
{
count++;
}
else
{
console.log(i);
console.log(req.body[i]);
}
}
getAsset()
})
//add the router
app.use('/', router);
app.listen(process.env.port || 8080);

