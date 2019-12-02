var Slides = function(id) {
  this._slides = SlidesApp.openById(id);
  this._allSlides_t = this._slides.getSlides();
  for (var i = 0; i < this._allSlides_t.length; i++) {
    this._allSlides.push(new this.Slide(this._allSlides_t[i]));
  }

  this._template = null;
  this._allSlides = [];
  
  this.totalHeight = 400;
  this.totalWidth = 720;
  this.maxHeight = 300;
  this.maxWidth = 250;
  this._ui = SlidesApp.getUi();

  this.addMenu = function(menuName, itemName, functionName) {
    if ((null != menuName) && (null != itemName) && (null != functionName)) {
      this._ui.createMenu(menuName).addItem(itemName, functionName).addToUi();
      return this;
    } else {
      throw new Error("You must specify menuName, itemName and functionName in Slides.addMenu");
    }
  };
  
  this.setTemplate = function(id, numSlides) {
    if (null != id) {
      this._template = SlidesApp.openById(id);
      if (null == this._template) {
        throw new Error("Could not find requested Google Slides template in Slides.setTemplate");
      }
      return this;
    } else {
      throw new Error("Template id is not defined for Slides.setTemplate");
    }
  };
  
  this.setDimensions = function(tHeight, tWidth, mHeight, mWidth) {
    if (underscoreGS._isNumber(tHeight) && underscoreGS._isNumber(tWidth) && underscoreGS._isNumber(mHeight) && underscoreGS._isNumber(mWidth)) {
      this.totalHeight = tHeight;
      this.totalWidth = tWidth;
      this.maxHeight = mHeight;
      this.maxWidth = mWidth;
      return this;
    } else {
      throw new Error("Height and width of dimensions need to all be integers in Slides.setDimensions");
    }
  };
                                  
  this.Slide = function(object) {
    this.slide = object;
    this.replaceImage = function(picture) {
      if (null != picture) {
        var pageElements = this.slide.getPageElements();
        for (var j = 0; j < pageElements.length; j++) {
          if (pageElements[j].getPageElementType() == SlidesApp.PageElementType.IMAGE) {
            pageElements[j].asImage().replace(picture);
            return j;
          }
        }
        throw new Error("Could not find picture on slide in Slide.replaceImage");
      } else {
        throw new Error("Picture not defined in Slide.replaceImage");
      }
    }

    this.getNotes = function() {
      return this.slide.getNotesPage().getSpeakerNotesShape().getText().asString();
    };
    this.setNotes = function(text) {
      if (null != text) {
        this.slide.getNotesPage().getSpeakerNotesShape().getText().setText(text);
        return this;
      } else {
        throw new Error("Notes text cannot be blank in Slide.setNotes");
      }
    };
    this.setTitle = function(title) {
      if (null != title) {
        this.slide.getPlaceholder(SlidesApp.PlaceholderType.TITLE).asShape().getText().setText(title);
        return this;
      } else {
        throw new Error("Slide title cannot be blank in Slide.setTitle");
      }
    };
    this.setBody = function(body) {
      if (null != body) { 
        this.slide.getPlaceholder(SlidesApp.PlaceholderType.BODY).asShape().getText().setText(body);   
        return this;
      } else {
        throw new Error("Body cannot be blank in Slide.setBody");
      }
    };
    this.setList = function(text) {
      if (null != text) { 
        this.slide.getPlaceholder(SlidesApp.PlaceholderType.BODY).asShape().getText().setText(text).getListStyle().applyListPreset(SlidesApp.ListPreset.DISC_CIRCLE_SQUARE);   
        return this;
      } else {
        throw new Error("Text cannot be blank in Slide.setList");
      }
    };
    
    this.addItems = function(questionOptions) {
      var choices = questionOptions.split("\n");
      var textRange = "";
      for (var choice in choices) {
        textRange.appendText("\t" + choice + "\n");
      }
      this.setList(textRange);
    };
    
    this.addItem = function(type, sheet, form, row, optionsColumn) {
      switch (type) {
        case form.QUESTION_TYPES.TRUE_FALSE["string"]:
          this.setBody("True or False?");
          break;
        case form.QUESTION_TYPES.MULTIPLE_CHOICE["string"]:
          this.addItems(sheet.getValue(row, optionsColumn));
          break;
        case form.QUESTION_TYPES.MULTIPLE_SELECT["string"]:
          this.addItems(sheet.getValue(row, optionsColumn));
          break;
      }
    };


  };
  
  this.getSlide = function(num) {
    if (null != num) {
      return this._allSlides[num];
    } else {
      throw new Error("Could not get slide #" + num + " from slideshow in Slides.getSlide");
    }
  };
  
  this.addSlide = function(title, text, id) {
    var slideAdded = {};
    if (null != this._template) {
      if (this._template.getSlides().length > 0) {
        var slideToGet = this._allSlides.length % this._template.getSlides().length;
        slideAdded = this._slides.appendSlide(this._template.getSlides()[slideToGet]);
      } else {
        slideAdded = this._slides.appendSlide(this._template.getSlides()[0]);
      } 
    } else {
        slideAdded = this._slides.appendSlide();
    }
        
    return new Slide(slideAdded).setTitle(title).setBody(text).setNotes(id);
  };
  
  this.setTitle = function(slide, title) {
    if ((null != title) && (underscoreGS._isObject(slide))) {
      slide.setTitle(title);
      return this;
    } else {
      throw new Error("Setting the title requires the Slide object and the title to be defined in Slides.setTitle");
    }
  };
  
  this.getSlideById = function(id) {
    if (null != id) {
      for (var j = 0; j < this._allSlides.length; j++) {
        if (this._allSlides[j].getNotes().indexOf(id) == 0) {
          return this._allSlides[j];
        }
      }
      return null;
    } else {
      throw new Error("ID is not defined to remove in Slides.getSlideById");
    }
  }
  
  this.removeSlide = function(id) {
    if (null != id) {
      getSlideById(id).slide.remove();
      return this;
    } else {
      throw new Error("ID is not defined to remove in Slides.removeSlide");
    }
  };
  
  this.changePicture = function(slide, chosenPictureBlob) {
    if (underscoreGS._isObject(slide) && underscoreGS._isObject(chosenPictureBlob)) {
      var pageElements = slide.getPageElements();
      for (var pictureId = 0; pictureId < pageElements.length; pictureId++) {
        if (pageElements[pictureId].getPageElementType() == SlidesApp.PageElementType.IMAGE) {
          pageElements[pictureId].asImage().replace(chosenPictureBlob);
          return pictureId;
        }
      }
      return null;
    } else {
      throw new Error("Slide and blob of chosen picture need to be defined in Slides.changePicture");
    }
  };
  
  this.positionPicture = function(slide, id) {
    if (underscoreGS._isNumber(id) && underscoreGS._isObject(slide)) {
      var pageElements = slide.getPageElements();
      if (underscoreGS._isObject(pageElements)) {
        if (underscoreGS._isObject(pageElements[id])) {
          var height = pageElements[id].getHeight();
          var width = pageElements[id].getWidth();           
          if (height > width) {
            var newWidth = (this.maxHeight / height) * width;
            pageElements[id].setWidth(newWidth);
            pageElements[id].setHeight(this.maxHeight);
            pageElements[id].setLeft(this.totalWidth - newWidth - 10);
            pageElements[id].setTop(this.totalHeight - this.maxHeight - 10);
          } else {
            var newHeight = (this.maxWidth / width) * height;
            pageElements[id].setHeight(newHeight);
            pageElements[id].setWidth(this.maxWidth);
            pageElements[id].setTop(this.totalHeight - newHeight - 10);
            pageElements[id].setLeft(this.totalWidth - this.maxWidth - 10);
          }
          return this;
        } else {
          throw new Error("Could not get element id off of Slide object in Slides.positionPicture");
        }
      } else {
        throw new Error("Could not get slide specified by Slide object in Slides.positionPicture");
      }
    } else {
      throw new Error("ID and Slide need to be defined in Slides.positionPicture");
    }
  };
}
