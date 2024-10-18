import { Router } from "express";

const resourceRouter = Router();

resourceRouter.get("/protected", (req, res) => {
    return res.status(200).json({message:"Добро пожаловать!" + Date.now()})
});

export default resourceRouter