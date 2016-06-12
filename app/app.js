var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var multer = require('multer');
var unzip = require('unzip2');
var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Info = require('./models/InfoModel.js');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './../../uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('file');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
var saveData = function(obj, code) {
    //console.log('here');
    var data = new Info({
        accessCode: code,
        data: obj
    });
    Info.find({accessCode: code}, function(err, users) {
        if (err) {
            console.log(err);
            return;
        }
        //console.log(users.length);
        if (users.length == 0)  {
            data.save(function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
               // console.log('added');
            });
        } else {
            Info.update({accessCode: code}, {
                accessCode: code,
                data: obj
            }, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
               // console.log('modified');
            });
        }
    });
};

app.post('/upload/zip', function(req, res) {
    var accessCode = req.query.accessCode;
    if (!accessCode) {
        res.sendStatus(400);
        return;
    }

    upload(req,res,function(err){
        if(err){
            res.sendStatus(400);
            return;
        }

        try {
            deleteFolderRecursive('./../../uploads/rez-' + accessCode );

            fs.createReadStream('./../../uploads/file.zip')
                .pipe(unzip.Extract({ path: './../../uploads/rez-' + accessCode }));
            }
        catch (e) {
            res.json({error_code:400,err_desc:'unpack error'});
            return;
        }
        res.sendStatus(200);
    })
});

app.post('/upload/json', function(req, res) {
    var accessCode = req.query.accessCode;
    if (!accessCode) {
        res.sendStatus(400);
        return;
    }

    upload(req,res,function(err){
        if(err){
            res.sendStatus(400);
            return;
        }

        try {
            fs.createReadStream('./../../uploads/file.json')
                .pipe(fs.createWriteStream('./../../uploads/rez-' + accessCode + '-file.json'));
            fs.createReadStream('./../../uploads/file.json')
                .pipe(fs.createWriteStream('./../../uploads/rez-' + accessCode + '-file-rev.json'));

            var obj = JSON.parse(fs.readFileSync('./../../uploads/file.json', 'utf8'));
            saveData(obj, accessCode);
        }
        catch (e) {
            res.json({error_code:400,err_desc:'file error'});
            return;
        }
        res.sendStatus(200);
    })
});

app.listen(8123);

module.exports = app;
