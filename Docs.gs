var Docs = function(id) {
  this.SEPARATOR = DocumentApp.GlyphType.BULLET;
  this.docObject = null;
  if (underscoreGS._isNumber(id)) {
    this.docObject = DocumentApp.openById(id);
  } else {
    throw new Error("id needs to be defined for Docs()");
  }
  if (null == this.docObject) throw new Error("Document not found in Docs()");
  
  this._ui = DocumentApp.getUi();

  this.addMenu = function(menuName, itemName, functionName) {
    if ((null != menuName) && (null != itemName) && (null != functionName)) {
      this._ui.createMenu(menuName).addItem(itemName, functionName).addToUi();
      return this;
    } else {
      throw new Error("menuName, itemName and functionName need to be defined for Docs.addMenu");
    }
  };

  this.appendItem = function(text, title, link) {
    if ((null != text) && (null != title) && (null != link)) {
      this.docObject.getBody().appendListItem(text + ": " + title).setGlyphType(this.SEPARATOR).setLinkUrl(link);
      return this;
    } else {
      throw new Error("Text, title and link need to be defined for Docs.appendItem");
    }
  };

  this.appendHeading = function(text, level) {
    if (null != text) {
      if (null == level) level = "Normal";
      var headingType = null;
      if (level == 3) {
        headingType = DocumentApp.ParagraphHeading.HEADING3;
      } else if (level == 2) {
        headingType = DocumentApp.ParagraphHeading.HEADING2;
      } else if (level.toUpperCase().startsWith("N")) {
        headingType = DocumentApp.ParagraphHeading.NORMAL;
      } else if (level.toUpperCase().startsWith("T")) {
        headingType = DocumentApp.ParagraphHeading.TITLE;
      } else {
        throw new Error("Did not recognize level in Docs.appendHeading");
      }
      this.docObject.getBody().appendParagraph(text).setHeading(headingType);
      return this;
    } else {
      throw new Error("Text needs to be defined for the heading in Docs.appendHeading");
    }
  };
  
  this.clearBody = function() {
    this.docObject.getBody().setText("");
  }
  
  this.writeClassroomDocuments = function(topic, options) {
    if (!underscoreGS._isObject(options)) options = {};
    
    if (!options["dueDate"]) options["dueDate"] = "Due Date: ";
    if (!options["dateOrder"]) options["dateOrder"] = "MDY";
    if (!options["dateDelimiter"]) options["dateDelimiter"] = "/";
    if (!options["displayTitle"]) options["displayTitle"] = true;
    if (!options["displayAnnouncements"]) options["displayAnnouncements"] = true;
    if (!options["displayCoursework"]) options["displayCoursework"] = true;
    if (!options["displayCourseworkTitle"]) options["displayCourseworkTitle"] = true;
    if (!options["displayDueDate"]) options["displayDueDate"] = true;
    if (!options["displayDescription"]) options["displayDescription"] = true;
    if (!options["displayMaterials"]) options["displayMaterials"] = true;
    if (!options["displayFiles"]) options["displayFiles"] = true;
    if (!options["displayVideos"]) options["displayVideos"] = true;
    if (!options["displayLinks"]) options["displayLinks"] = true;
    if (!options["displayForms"]) options["displayForms"] = true;
    
    this.clearBody();
    if (options["displayTitle"]) this.appendHeader(topic, "Title");
    if (options["displayAnnouncements"]) { 
      for (var announcement in topic.announcements.titles) {
        this.appendHeader(announcement["title"], topic.announcements.level);
      }
    }
    
    if (options["displayCoursework"]) {
      for (var courseWork in topic.courseWork.titles) {
        if (options["displayCourseworkTitle"]) this.appendParagraph(courseWork.title, 2);
        if (options["displayDueDate"] && courseWork.dueDate) {
          var dueDateString = options["dueDate"];
          for (var i = 0; i < options["dateOrder"].length; i++) {
            var currentLetter = options["dateOrder"].substring(i, i + 1);
            if (currentLetter == "M") dueDateString += courseWork["dueDate"]["month"];
            else if (currentLetter == "D") dueDateString += courseWork["dueDate"]["day"];
            else if (currentLetter == "Y") dueDateString += courseWork["dueDate"]["year"];
            if (i < (options["dateOrder"].length - 1)) dueDateString += "/";
          }            
          this.appendParagraph(dueDateString, 3);
        }
        if (options["displayDescription"] && courseWork.description) {
          this.appendParagraph(courseWork.description, "Normal");
        }
        if (options["displayMaterials"] && courseWork.materials) {
          this.appendParagraph("Materials:", "Normal");
          for (var material in courseWork.materials) {
            if (options["displayFiles"] && material.file) {
              this.appendItem("File", material.title, material.file);
            } else if (options["displayVideos"] && material.video) {
              this.appendItem("Video", material.title, material.video);
            } else if (options["displayLinks"] && material.link) {
              this.appendItem("Link", material.title, material.link);
            } else if (options["displayForms"] && material.form) {
              this.appendItem("Form", material.title, material.form);
            }
          }
        }
      }
    }
  }

};
