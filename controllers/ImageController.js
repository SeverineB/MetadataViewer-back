const Image = require('../models/ImageModel');
const path = require('path');
const fs = require('fs');
const exifr = require('exifr');

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
        const imageName = image.imagePath.replace('./', '');
        const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${imageName}`;
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
     res.status(500).send(error);
    }
  },

  // Upload a picture

  add: async (req, res) => {
    try {
      // save image path in db
      const imagePath = req.file.path;
      const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${req.file.filename}`;

      const newImage = await Image.create({
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        imagePath
      })
      await newImage.save();
      
      res.send({
        id: newImage._id,
        imageUrl: imageUrl,
        metadata: {
          name: newImage.name,
          size: newImage.size,
          type: newImage.type,
        },
        imagePath: newImage.imagePath,
        message: 'Le fichier a bien été uploadé !'})
    } catch (error) {
      res.status(500).send(error)
      }
  },

  // Delete a picture

  findByIdAndDelete: async (req, res) => {
    const imageId = req.params.id;
    try {
      const imageUrl = await Image.findByIdAndDelete(imageId);
      console.log('imageUrl', imageUrl);
      if (!imageUrl) {
        res.status(401).send(error)
      }
      console.log('image supprimée en bdd');

      fs.unlink(imageUrl.imagePath, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Image supprimée en file system');      
        }
      })
      res.status(200).send('L\'image a bien été supprimée');
    } catch (error) {
      res.status(500).send(error)
    } 
  }
}