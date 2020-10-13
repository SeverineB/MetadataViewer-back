const Image = require('../models/ImageModel');
const path = require('path');
const fs = require('fs');
const im = require('gm').subClass({imageMagick: true });
const ExifImage = require('exif').ExifImage;
const config = require('config');

module.exports = {

  // Get all the Pictures

  findAll: async (req, res) => {
    try {
      const images = await Image.find({})
      console.log('IMAGES ',images);
      // modify imagePath stored in db for each document to construct the real url
      const imagesUrl = images.map((image) => {
        console.log('IMAGE DANS FINDALL :', image)
        const imageName = image.imagePath.replace('./', '');
        const host = process.env.HOST;
        const protocol = process.env.PROTOCOL;
        const port = process.env.PORT;
        const imageUrl = `${protocol}://${host}:${port}/${imageName}`;
        const id = image._id;
        const { name, size, type } = image;
        return {id, imageUrl, metadata: {name, size, type}};
      })
      res.send(imagesUrl)
    } catch (error) {
      res.status(500).send()
    }
  },

  // Upload a picture

  add: async (req, res) => {
    console.log('req.file.path :', req.file.path)
    console.log('req.file :', req.file)

    try {
      // save image path in db
      const imagePath = req.file.path;
      const newImage = await Image.create({
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        imagePath})
      await newImage.save();
      console.log('req file filename :', req.file.filename);
      console.log('REQ FILE NAME ', req.file.originalname);
      res.send({
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
          console.log('Image bien supprimée en file system');      
        }
      })
      res.status(200).send('L\'image a bien été supprimée');
    } catch (error) {
      res.status(500).send()
    } 
  }
}