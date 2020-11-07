const multer = require('multer');
const fs = require('fs');

//
// Define function to store files in file system
//

// define multer storage and define name of the file
const storage = multer.diskStorage({

 destination: (req, file, cb) => {
    const { userId } = req.params;
    fs.exists(`./images/${userId}`, exist => {
      if (!exist) {
        console.log('dossier existe pas');
        return fs.mkdir(`./images/${userId}`, error => cb(error, `./images/${userId}`))
      }
      return cb(null, `./images/${userId}`)
    })
  },
  /* destination: (req, file, cb) => {
    cb(null, './images');
  }, */
  fileName: (req, file, cb) => {
    const fileName = req.file.originalName.toLowerCase().split(' ').join('-');
    cb(null, `${fileName}_${Date.now()}`)
  }
});

// validate the mime types allowed

const fileFilter = (req, file, cb) => {
  console.log('je suis dans fileFilter');
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}

module.exports = multer({ storage: storage, limits: {/* fileSize: 8000000,  */fileFilter: fileFilter }}).single('image');


