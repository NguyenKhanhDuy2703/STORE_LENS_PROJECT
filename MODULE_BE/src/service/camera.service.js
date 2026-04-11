const cameraService = {
    async updateImgforCamera({locationId , cameraCode , urlImg}){
        const result = await cameraSchema.updateOne({
            location_id : locationId,
            camera_code : cameraCode,
        },{
            $set: {
                url_img : urlImg,
            },
        })
        return result;
    }
}
module.exports = cameraService;