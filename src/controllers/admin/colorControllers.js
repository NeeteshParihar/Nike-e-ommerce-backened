import MasterColorModel from "../../models/color.js"


export const createNewColor = async( req, res)=>{
    try{

        const {name, hexCode, group} = req.body;
        const newColor = await MasterColorModel.create({
            name,
            hexCode,
            group
        });
        
        return res.status(201).json({
            success: true,
            data: newColor
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
