import { Router } from "express";
import {generateCookie} from "../service/auth.js";
import { verifyCookie } from "../service/auth.js";
import user_model from "../model/users_model.js";

const apiRouter = Router();

//==============================================================================================
//==============================================================================================
apiRouter.post("/login", async (req, res) => {

    const { email, name, token } = req.body;
    const user = await user_model.findOne({ email });
    
    if (!user) {
        res.json({ message: "user not in database",route: "/signup" });
    }
    else {
        console.log(user)
        const cookie = await generateCookie(user, user.role);
        console.log(cookie);
        res.cookie("jwt", cookie, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.json({ message: "login successfull", route: "/dashboard" ,avatarURL: user.avatarURL});
    
    }

});


//==============================================================================================
//==============================================================================================

apiRouter.post("/signup", async (req, res) => {
    // console.log(req.body)
    const { email, name, token,phone,parentEmail,parentPhone,roomNumber,avatarURL,gender,dob,batch } = req.body;
    //cheking if anything is empty
    if(!email || !name || !token || !phone || !parentEmail ||!parentPhone || !roomNumber || !gender || !dob || !batch){
        res.status(400);
        res.json({ message: "all fields required" });
        
    }
    else{
        const user = await user_model.findOne({ email });
        if (user) {
            res.json({ message: "user already in database" });
        }
        else {
            const newUser = new user_model({
                email,
                name,
                role: "student",
                phone,
                parentEmail,
                parentPhone,
                roomNumber,
                gender,
                dob,
                batch,
    
            });
            await newUser.save();
            const cookie = await generateCookie({
                email: email,
            }, "student");
            res.cookie("jwt", cookie, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000 
            });
            res.json({ message: "user created" });
        }
    }
});


//==============================================================================================
//==============================================================================================


apiRouter.post("/verify", async (req, res) => {
    const cookie = req.cookies.jwt;
    const user = await verifyCookie(cookie);
    if (user) {
        const item =await user_model.findOne({email: user.email})
        if(item){
            res.json({ message: "cookie verified", user });
        }
        else{
            res.json({ message: "cookie not verified" });
        }
       
    }
    else {
        res.json({ message: "cookie not verified" });
    }
});



//==============================================================================================
//==============================================================================================


apiRouter.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: "Logged out successfully" });
});
  


//==============================================================================================
//==============================================================================================





// GET /api/users
apiRouter.get('/users', async (req, res) => {
    try {
      const users = await user_model.find({}, 'name email avatarURL'); // only return necessary fields
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  







  apiRouter.get("/user/:id", async (req, res) => {
    try {
      const student = await user_model.findById(req.params.id)
      res.json({ student });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  




  apiRouter.get('/today', async (req, res) => {
    try {
      const today = new Date();
      const mmdd = (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
  
      const usersWithBirthdayToday = await user_model.find({
        dob: { $regex: `-${mmdd}$` } // matches any date ending with -MM-DD
      });
  
      res.json(usersWithBirthdayToday);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
















import studentRouter from "./studentRouter.js";

apiRouter.use("/student", studentRouter);


import adminRouter from "./adminRouter.js";

apiRouter.use("/admin", adminRouter);


export default apiRouter;