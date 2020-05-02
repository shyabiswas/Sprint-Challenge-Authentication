const router = require('express').Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const secret = require("../config/secret")
const Users = require("../users/usersModel")

router.post('/register', (req, res) => {
  // implement registration
  const user= req.body
  const hash = bcrypt.hashSync(user.password, 10)
  user.password = hash
  Users.insertUser(user)
  .then(newUser =>{
    user.id = newUser[0]
    delete user.password
    const token = generateToken(user)
    res.status(201).json({user, token})
  })
  .catch(error=>{
    res.status(500).json(error);
  })


});

router.post("/login", (req, res)=>{
  let {username, password}  = req.body;
  Users.findBy({username})
  .first()
  .then(user =>{
      if (user && bcrypt.compareSync(password, user.password)){
          const token = generateToken(user);
          res.status(200).json({username: user.username, token: token});
      } else {
          res.status(401).json({message: "Invalid Credentials"});
      }
  
  })
      .catch(error =>{
          res.status(500).json(error);
      })
});
function generateToken(user){
  const payload = {
    userid: user.id,
    username: user.username
  }
  const options ={
    expiresIn: "10000d"
  }
  const token = jwt.sign(payload, secret.jwtSecret, options)
  return token
}

module.exports = router;
