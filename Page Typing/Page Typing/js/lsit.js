aws_config()
var s3 = new AWS.S3();
var dynamodb = new AWS.DynamoDB();
function login(Userdata){
  document.getElementById("test").innerHTML = "Login...";
  var params = {
    Key: {
     "email": {
       S: Userdata["username"]
      }
    }, 
    TableName: "booktyping-pro-users"
   };
   dynamodb.getItem(params, function(err, data) {
      if (err){
          console.log(err, err.stack);
      }else{
          if(Object.keys(data).length != 0){
            const userData = {
              "name": data["Item"]["fullname"]["S"],
              "email": data["Item"]["email"]["S"],
              "totalPages": data["Item"]["pagesCount"]["S"],
              "pagesCompleted": data["Item"]["pagesCompleted"]["S"],
              "startDate": data["Item"]["startDate"]["S"],
              "lastDate": data["Item"]["lastDate"]["S"]
          }

            if(Userdata["password"] ==  data["Item"]["password"]["S"]){
              sessionStorage.setItem("userData", btoa(JSON.stringify(userData)))
              location = "dashboard.html";
            }else{
              document.getElementById("test").innerHTML = "Incorrect Password";
            }
          }else{
            document.getElementById("test").innerHTML = "User Not Found";
          }
      }
   });
}

function register(data){
    var params = {
      Bucket: "booktypingprodata",
      Prefix: data["email"]
    };

    s3.listObjects(params, function(err, data2) {
      if (err) {
        console.error('Error listing objects:', err);
      } else {
        var objects = data2.Contents.map(function(obj) {
          return { Key: obj.Key };
        });
        deleteObjects(objects);
        var params = {
          Item: {
            "email": {
             S: data["email"]
            },
            "fullname": {
             S: data["fullname"]
            },
            "pagesCount": {
              S: data["pagesCount"]
             },
            "pagesCompleted": {
              S: "0"
             },
            "startDate": {
              S: data["startDate"]
             },
            "lastDate": {
              S: data["lastDate"]
            },
            "password": {
              S: data["password"]
            }
          }, 
          ReturnConsumedCapacity: "TOTAL",
          TableName: "booktyping-pro-users"
         };
         dynamodb.putItem(params, function(err, success) {
           if (err){
              console.log(err, err.stack);
           }else{
              sendEmail(data);
           }
         });
      }
    });
  }

function employee_list(){
  var params = {
    TableName: "booktyping-pro-users"
   };
   dynamodb.scan(params, function(err, data) {
    if (err){
        console.log(err, err.stack);
    }else{
        show(data)
    }
   });
}

function sendEmail(data){
  var content = `Dear ${data["fullname"]},\n
Congratulations 💐💐💐, \n
Welcome to Page Typing! We look forward to working with you. Please read the following instructions carefully: \n
Login Details: \n
    Login Link: https://pagetyping.com
    Username: ${data["email"]}
    Password: ${data["password"]}
    Technical Support: +91 84348 99800 (Monday to Friday, 11 AM to 5 PM). \n\n
Terms and Conditions: \n

1) Offer Letter: Sign and return via email to hr@pagetyping.com before starting work.
2) Training: Extra time is provided for the first two training projects.
3) Final Project: Achieve 90% accuracy within the given time.
4) Payouts: Weekly payouts, issued 5-7 days after project completion. Full payment for 90% accuracy; otherwise, Rs 2.5 per correct page (minimum 15 pages).
5) Support Hours: Technical support is available Monday to Friday, 11:00 AM to 05:00 PM.
6) Working Hours: Flexible, except on weekends.
7) Support Contact: Call for technical issues; use WhatsApp for other queries with full details.
8) Device Requirements: No external software for auto-correction or auto-spacing.
9) Devices: Work on phone or laptop. No Refunds: No refund policy upon resignation.
10) Validation: Registration is valid for 3 months; no breaks longer than 3 months.
11) Completion Time: Each page must be completed within 8 minutes. No copy-pasting; violations result in immediate termination.
12) Focus: Stay focused; switching pages triggers automatic logout and potential loss of progress. \n\n
Thanks and Regards, 
Page Typing Technical Team`;

  fetch('https://ii7rmwatti.execute-api.ap-south-1.amazonaws.com/LSIT/',
      {
          method: "POST",
          body: JSON.stringify({
              "to": data["email"],
              "subject": "Registration Successful",
              "content": content
          })
      }).then(response => {
          }).then(data => {
              alert("User Registered Successfully");
              location = "admin.html?code=YWRtaW5pc3RyYXRvckBnbWFpbC5jb20=";
          })
          .catch(error => {
              console.log(error);
          });
      }
function deleteObjects(objects) {
  if (objects.length === 0) {
    return;
  }
  var batch = objects.slice(0, 1000);
  var deleteParams = {
    Bucket: 'booktypingprodata',
    Delete: { Objects: batch }
  };

  s3.deleteObjects(deleteParams, function(err, data) {
    if (err) {
      console.error('Error deleting objects:', err);
    } else {
      deleteObjects(objects.slice(1000));
    }
  });
}

function deleteUser(obj){
    var result = window.confirm("Are you sure you want to delete userid "+obj.id);
    // Check user's response
    if (result) {
      var params = {
        Bucket: "booktypingprodata",
        Prefix: obj.id
      };
  
      s3.listObjects(params, function(err, data) {
        if (err) {
          console.error('Error listing objects:', err);
        } else {
          var params = {
            Key: {
             "email": {
               S: obj.id
              }
            },
            TableName: "booktyping-pro-users"
           };
           dynamodb.deleteItem(params, function(err, data) {
             if (err) console.log(err, err.stack); // an error occurred
             else     alert("UserId "+ obj.id + " Removed Successfully...");           // successful response
           });
        }
      });
    }
}

function getUserData(username){
  var params = {
    Key: {
     "email": {
       S: username
      }
    }, 
    TableName: "booktyping-pro-users"
   };
   dynamodb.getItem(params, function(err, data) {
      if (err){
          console.log(err, err.stack);
      }else{
          if(Object.keys(data).length != 0){
            const userData = {
              "name": data["Item"]["fullname"]["S"],
              "email": data["Item"]["email"]["S"],
              "totalPages": data["Item"]["pagesCount"]["S"],
              "pagesCompleted": data["Item"]["pagesCompleted"]["S"],
              "startDate": data["Item"]["startDate"]["S"],
              "lastDate": data["Item"]["lastDate"]["S"]
          }
          sessionStorage.setItem("userData", btoa(JSON.stringify(userData)));
          location = "result.html";
        }
      }
   });
}

function getUserDashboard(username){
  var params = {
    Key: {
     "email": {
       S: username
      }
    }, 
    TableName: "booktyping-pro-users"
   };
   dynamodb.getItem(params, function(err, data) {
      if (err){
          console.log(err, err.stack);
      }else{
          if(Object.keys(data).length != 0){
            const userData = {
              "name": data["Item"]["fullname"]["S"],
              "email": data["Item"]["email"]["S"],
              "totalPages": data["Item"]["pagesCount"]["S"],
              "pagesCompleted": data["Item"]["pagesCompleted"]["S"],
              "startDate": data["Item"]["startDate"]["S"],
              "lastDate": data["Item"]["lastDate"]["S"]
          }
          sessionStorage.setItem("userData", btoa(JSON.stringify(userData)));
          location = "dashboard.html";
        }
      }
   });
}

function PutPages(fields){
  document.getElementById("pageBody").innerHTML = "Submitting";
  var params = {
    Body: JSON.stringify(fields),
    Bucket: "booktypingprodata",
    Key: `${fields["email"]}/page${fields["pageNumber"]}`
   };
   s3.putObject(params, function(err, data) {
     if(err){
      console.log(err, err.stack); // an error occurred
     }else{
      var params = {
        Key: {
         "email": {
           S: fields["email"]
          }
        }, 
        TableName: "booktyping-pro-users"
       };
       dynamodb.getItem(params, function(err, data) {
          if (err){
              console.log(err, err.stack);
          }else{
              if(Object.keys(data).length != 0){
              const userData = {
                  "name": data["Item"]["fullname"]["S"],
                  "email": data["Item"]["email"]["S"],
                  "totalPages": data["Item"]["pagesCount"]["S"],
                  "pagesCompleted": fields["pageNumber"],
                  "startDate": data["Item"]["startDate"]["S"],
                  "lastDate": data["Item"]["lastDate"]["S"]
              }
              var params = {
                Item: {
                  "email": {
                   S: data["Item"]["email"]["S"]
                  },
                  "fullname": {
                   S: data["Item"]["fullname"]["S"]
                  },
                  "pagesCount": {
                    S: data["Item"]["pagesCount"]["S"]
                   },
                  "pagesCompleted": {
                    S: fields["pageNumber"]
                   },
                  "startDate": {
                    S: data["Item"]["startDate"]["S"]
                   },
                  "lastDate": {
                    S: data["Item"]["lastDate"]["S"]
                  },
                  "password": {
                    S: data["Item"]["password"]["S"]
                  }
                }, 
                ReturnConsumedCapacity: "TOTAL",
                TableName: "booktyping-pro-users"
               };
               dynamodb.putItem(params, function(err, data) {
                 if (err){
                    console.log(err, err.stack);
                 }else{
                    sessionStorage.setItem("userData", btoa(JSON.stringify(userData)))
                    alert("Your Page " + fields["pageNumber"] + " Submitted Successfully");
                    location = "dashboard.html";
                 }
               });
              }else{
                document.getElementById("test").innerHTML = "User Not Found";
              }
          }
       }); 
     }     
   });
}

function getdata(){
  data = JSON.parse(atob(sessionStorage.getItem("userData")));
  for(var i=1;i<=data["pagesCompleted"];i++){
    var params = {
      Bucket: "booktypingprodata",
      Key: data["email"]+"/page"+i
     };
     s3.getObject(params, function(err, data) {
       if (err){
        console.log(err, err.stack); // an error occurred
       }else{
        var data = data.Body.toString('utf-8')
        document.getElementById('loadingSpinner').style.display = 'none';
        display(JSON.parse(data))
       }
     });
  }   
}

function getPage(){
  const queryParams = new URLSearchParams(window.location.search);
  const param1Value = queryParams.get('page');
  var params = {
    Bucket: "booktypingprodata",
    Key: userData["email"]+"/page"+param1Value
   };
   s3.getObject(params, function(err, data) {
     if (err){
      console.log(err, err.stack); // an error occurred
     }else{
      var data = data.Body.toString('utf-8')
      fieldDetails(JSON.parse(data))
     }
   });
}

function updateUserDetails(username, updatedName, updatedLastDate, updatedPassword){
  var params = {
    Key: {
     "email": {
       S: username
      }
    }, 
    TableName: "booktyping-pro-users"
   };
   dynamodb.getItem(params, function(err, data) {
      if (err){
          console.log(err, err.stack);
      }else{
          if(Object.keys(data).length != 0){
            var userData = {
              "name": data["Item"]["fullname"]["S"],
              "email": data["Item"]["email"]["S"],
              "totalPages": data["Item"]["pagesCount"]["S"],
              "pagesCompleted": data["Item"]["pagesCompleted"]["S"],
              "startDate": data["Item"]["startDate"]["S"],
              "lastDate": data["Item"]["lastDate"]["S"],
              "password": data["Item"]["password"]["S"]

          }

          if(updatedName != ""){
            userData["name"] = updatedName;
          }

          if(updatedLastDate != ""){
            userData["lastDate"] = updatedLastDate;
          }

          if(updatedPassword != ""){
            userData["password"] = updatedPassword;
          }

          var params = {
            Item: {
              "email": {
               S: userData["email"]
              },
              "fullname": {
               S: userData["name"]
              },
              "pagesCount": {
                S: userData["totalPages"]
               },
              "pagesCompleted": {
                S: userData["pagesCompleted"]
               },
              "startDate": {
                S: userData["startDate"]
               },
              "lastDate": {
                S: userData["lastDate"]
              },
              "password": {
                S: userData["password"]
              }
            }, 
            ReturnConsumedCapacity: "TOTAL",
            TableName: "booktyping-pro-users"
           };
           dynamodb.putItem(params, function(err, success) {
             if (err){
                console.log(err, err.stack);
                alert("Error in updating data")
             }else{
                alert("User Data Updated Successfully...")
             }
           });
        }
      }
   });
}

function reverseString(str) {return str.split('').reverse().join('');}
function aws_config(){
    AWS.config.update(
        {
            region: "us-east-1",
            accessKeyId: reverseString("7INFS4SRL3W76N4WAIKA"),
            secretAccessKey: reverseString("YGXwF34TPJxEOmKyQbMvKt2+D9N+ibbSAq6eGL5Y")
        });
}