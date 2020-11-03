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
        // and specify the url in prod or dev environment
        const imageName = image.imagePath.replace('./', '');
        if (process.env.APP_ENV === 'local') {
          const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${imageName}`;
        } else if (process.env.APP_ENV === 'production') {
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
      res.status(500).send({
        message: 'Impossible de télécharger l\'image'
      })
      }
  },

  // Delete a picture

  findByIdAndDelete: async (req, res) => {
    const imageId = req.params.id;
    try {
      const imageUrl = await Image.findByIdAndDelete(imageId);

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
      res.status(200).send({
        message: 'L\'image a bien été supprimée'
      });
    } catch (error) {
      res.status(500).send({
        message: 'Impossible de supprimer l\'image'
      })
    } 
  }
}