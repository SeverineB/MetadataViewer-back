const Image = require('../models/ImageModel');
const User = require('../models/UserModel');
const sharp = require('sharp');
const fs = require('fs');
const exifr = require('exifr');
const user = require('../validations/user');

module.exports = {

  // Get all the Pictures with metadata

 findAll: async (req, res) => {

    try {

      const images = await Image.find({})

      // Promise.all send back a promise after all the promises inside are resolved
      const imagesToSend = await Promise.all(images.map(async (image) => {

        // Read and store metadata
        const exifMetadata = await exifr.parse(image.imagePath);

        // modify imagePath stored in db for each document to construct the real url
        // and specify the url in prod or dev environment
        const imageName = image.imagePath.replace('./', '');
        if (process.env.NODE_ENV === 'development') {
          const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${imageName}`;
        } else if (process.env.NODE_ENV === 'production') {
          const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}/${imageName}`;
        }
        
        const id = image._id;
        const { name, size, type } = image;

        // Send exifMetadata only if available
        if (!exifMetadata)
          return {image, metadata: {name, size, type}};
        else
          return {image, metadata: {name, size, type}, exifMetadata};
      }))

      // send data in response
      res.send(imagesToSend)

    } catch (error) {
        return res.status(500).send({
          message: 'Impossible de récupérer les images'
        });
    }
  },

  // Upload a picture

  add: async (req, res) => {

    try {
      
     /*  const { userId } = req.body; */
      const { userId } = req.params;

      // create a thumbnail of each image and store it in file system
      sharp(req.file.path)
      .resize(300, 200)
      .toFile(`images/thumbnails/` + 'thumbnails-' + req.file.filename + userId, (err, resizeImage) => {
        if (err) {
          console.log(err);
        } else {
          console.log(resizeImage);
        }
      });
      
      // define the image and thumbnail path
      const imagePath = req.file.path;
      const thumbnailPath = `images/thumbnails/thumbnails-${req.file.filename}${userId}`;

      // define image's url to send in response
      const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${req.file.filename}`;

      // save new image in db
      const newImage = await Image.create({
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        imagePath,
        thumbnailPath,
        userId
      })
      await newImage.save();
      const userById = await User.findById(newImage.userId);

      // add new image in images array of the selected user
      userById.images.push(newImage);
      await userById.save();
      
      res.send({
        id: newImage._id,
        imageUrl: imageUrl,
        metadata: {
          name: newImage.name,
          size: newImage.size,
          type: newImage.type,
        },
        thumbnailPath: thumbnailPath,
        imagePath: newImage.imagePath,})
    } catch (error) {
      res.status(500).send({
        message: 'Impossible de télécharger l\'image'
      })
      }
  },

  // Delete a picture

  findByIdAndDelete: async (req, res) => {
    const imageId = req.params.imageId;

    try {

      const imageUrl = await Image.findById(imageId);

      if (!imageUrl) {
        return res.status(404).send({
          message: 'Cette image n\'existe pas !'
        })
      } 

      // delete file stored on file system
      fs.unlink(imageUrl.imagePath, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Image supprimée en file system');      
        }
      })
      // delete thumbnail on file system
      fs.unlink(imageUrl.thumbnailPath, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Miniature supprimée en file system');      
        }
      })
 
      // delete image on images's user array in db
      await User.findOneAndUpdate({_id: req.params.id},
        {
          $pull: {
            images: req.params.imageId
          }
        },
        {
          new: true
        });
        console.log('je suis après le findbyIdAndUpdate');
  
      // delete image in db
      await Image.findByIdAndDelete(imageId);

      res.status(200).send({
        message: 'L\'image a bien été supprimée'
      });
    } catch (error) {
      res.status(500).send(error.message)
    } 
  },
}