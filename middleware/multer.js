const multer = require('multer');

//
// Define function to store files in file system
//

// define multer storage and define name of the file
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    console.log('file dans multer :', file)
    cb(null, './images');
  },
  fileName: (req, file, cb) => {
    const fileName = file.originalName.toLowerCase().split(' ').join('-');
    cb(null, `${fileName}_${Date.now()}`)
  }
});

// validate the mime types allowed

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}

module.exports = multer({ storage: storage, limits: {/* fileSize: 8000000,  */fileFilter: fileFilter }}).single('image');


