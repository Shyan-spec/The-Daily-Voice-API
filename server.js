const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const connection = require('./db.js')
const cors = require('cors')
const { response } = require('express')
const app = express()
app.use(bodyParser.json())
app.use(cors())

const db = require('knex')({
    client: 'mysql',
    connection: {
      host : 'localhost',
      port : 3306,
      user : 'root',
      password : 'password',
      database : 'mystatusapp'
    }
  });

const database = {
    users : [
        {
            id: '123',
            username: 'Shyan',
            password: 'cookies',
            joined: new Date()

        },
        {
            id: '124',
            username: 'Saint',
            password: 'butter',
            joined: new Date()

        }

    ]
}

console.log(db.select('*').from('users').then(data => {
    console.log(data)
}))



/*
app.get("/", (req, res) => {
    const ADD_QUERY = "INSERT INTO movie_reviews (movieName, movieReviews) VALUES ('good times', 'bad movie')" 
    connection.query(ADD_QUERY,(err) => {
        if(err) console.log(err)
        else res.send('task has been added')
    });
    
})
*/

const dbs = {
    posts : [
]
}
    


app.get('/', (req, res) => {
    db.select('*').from('statuses').then(data => {
       res.send(data)
    })
    
  
})



app.post("/signin", (req, res) => {
   db.select('username', 'hash')
   .from('login')
   .where('username', '=' , req.body.username)
   .then(data => {
       const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
       if(isValid) {
           return db.select('*')
           .from('login')
           .where('username', '=', req.body.username)
           .then(user => {
               res.json(user[0])
           })
           .catch(err => res.status(400).json('unsable to get user'))
       }
       else{
        res.status(400).json('Wrong Credientials');
       }
   })
   .catch(err => res.status(400).json('Wrong Credientials'))
})

app.post("/register", (req, res) => {
const {username, password, retypePassword} = req.body;
const hash = bcrypt.hashSync(password);
db.transaction(trx => {
    trx.insert({
        hash: hash,
        username: username
    })
    .into('login')
    .then(loginUsername => {
        if(password == retypePassword) {
            return trx('users')
            .insert({
                username: loginUsername[0],
                joined: new Date(),
                
            }).then(user => {
                res.json(user[0])
            })
            }
            
            
    }).catch(err => res.status(400).json('Passwords are not the same'))
    .then(trx.commit)
.catch(trx.rollback)
})
})

app.post('/statusList', (req,res) => {
    const {textbox, username} = req.body;
    db.insert({username: username, statusText: textbox, createdAt: new Date()})
    .into('statuses')
    .then(user => {
        res.json(user)
    })
    .catch(err => res.status(400).json('Text is empty'))
    
})




//localHost:3001
app.listen(3001, () => {
    console.log("Server is up and listening on 3001...");
})
