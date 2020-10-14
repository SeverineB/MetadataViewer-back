const Image = require('../models/ImageModel');
const path = require('path');
const fs = require('fs');
const exifr = require('exifr');

module.exports = {

  // Get all the Pictures with metadata

  findAll: async (req, res) => {
    try {
      const images = await Image.find({})
      console.log('IMAGES ',images);
    
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
      /* res.send(imagesToSend) */
      res.send(imagesToSend)
    } catch (error) {
      res.status(500).send('ERROR ', error.message)
    }
  },

  // Upload a picture

  add: async (req, res) => {
    try {
      // save image path in db
      const imagePath = req.file.path;
      console.log('REQ FILE DANS ADD ', req.file);
      const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${req.file.filename}`;
      console.log(imageUrl);
      const newImage = await Image.create({
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        imagePath
      })
      await newImage.save();
      console.log('req file filename :', req.file.filename);
      console.log('REQ FILE NAME ', req.file.originalname);
      
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
      res.status(500).send(error.message)
      }
  },

  // Delete a picture

  findByIdAndDelete: async (req, res) => {
    const imageId = req.params.id;
    try {
      const imageUrl = await Image.findByIdAndDelete(imageId);
      console.log('imageUrl', imageUrl);
      if (!imageUrl) {
        res.status(401).send()
      }
      console.log('image supprimée en bdd');

      fs.unlink(imageUrl.imagePath, (err) => {
        if (err) {
          throw err
        } else {
          console.log('Image supprimée en file system');      
        }
      })
      res.status(200).send('L\'image a bien été supprimée');
    } catch (error) {
      res.status(500).send()
    } 
  }
}