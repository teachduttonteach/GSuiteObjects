var Drive = function() {
  this.getRandomPicture = function(folder) {
    if (null != folder) {
      var dailyPicturesFolder = DriveApp.getFolderById(folder);
      if (null != dailyPicturesFolder) {
        var dailyPictures = dailyPicturesFolder.getFiles();
        var allPictures = [];
        while (dailyPictures.hasNext()) {
          var pic = dailyPictures.next();
          if (["image/png", "image/gif", "image/jpeg"].indexOf(pic.getMimeType()) >= 0) {
            allPictures.push(pic.getAs("image/png"));
          }
        }
        if (allPictures.length > 0) {
          return chosenPicture = allPictures[Math.floor(Math.random() * Math.floor(allPictures.length))];
        } else {
          throw new Error("No pictures found in Drive.getRandomPicture");
        }
      } else {
        throw new Error("Could not find folder in Drive.getRandomPicture");
      }
    } else {
      throw new Error("Folder must be defined in Drive.getRandomPicture");
    }
  };
  
  this.getImageBlob = function(name) {
    if (null != name) {
      if (DriveApp.getFileById(name)) {
        switch (DriveApp.getFileById(name).getMimeType()) {
          case "image/jpeg":
          case "image/png":
          case "image/gif":
            return DriveApp.getFileById(name).getBlob();
        }
      }
      return null;
    } else {
      throw new Error("Name needs to be defined for Drive.getImageBlob");
    }
  };
  
  this.getOrCreateFile = function(fileName, templateName) { 
    if ((null != fileName) && (null != templateName)) {
      var fileObject = DriveApp.getFilesByName(fileName);
      if (!fileObject.hasNext()) {
        fileObject = DriveApp.getFilesByName(templateName).next().makeCopy(fileName);
      } else {
        fileObject = fileObject.next();
      }
      return fileObject;
    } else {
      throw new Error("File name and template name need to be defined for Drive.getOrCreateFile");
    }
  };
};