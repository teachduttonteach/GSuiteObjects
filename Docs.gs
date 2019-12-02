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
  
  this.writeDocument = function() {
  };
};
