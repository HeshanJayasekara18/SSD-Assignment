

const testGetMethod=(req,res)=>{
    res.send("Welcome to Express.js Backend!");
}

const welcomeMsg=(req,res)=>{
    res.send("Welcome to Hello Worlkd!");
}
module.exports={testGetMethod,welcomeMsg}