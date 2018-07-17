/*var obj = require('./fengji1.ty');
console.log(obj);
obj.OBJECTINFO();*/
//obj.base.OBJECTINFO();
var fs = require('fs');
var fs_list =  fs.readdirSync('./');
console.log(fs_list);