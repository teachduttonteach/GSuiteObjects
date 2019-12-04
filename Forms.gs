var QUESTION_TYPE = function() {
  this.PARAGRAPH = {
    "code": 1,
    "string": "Paragraph"
  };
  this.MULTIPLE_CHOICE = {
    "code": 2,
    "string": "Multiple Choice"
  };
  this.MULTIPLE_SELECT = {
    "code": 3,
    "string": "Multiple Select"
  };
  this.MC_GRID = {
    "code": 4,
    "string": "MC Grid"
  };
  this.MS_GRID = {
    "code": 5,
    "string": "MS Grid"
  };
  this.SHORT_ANSWER = {
    "code": 6,
    "string": "Short Answer"
  };
  this.TRUE_FALSE = {
    "code": 7,
    "string": "True / False"
  };
};

var Form = function(id) {
  this.form = null;
  if (underscoreGS._isNumber(id)) {
    this.form = FormApp.openById(id);
  } else {
    throw new Error("Form id needs to be defined in Form()");
  }
  if (null == this.form) throw new Error("Form not found in Form()");
  
  this._ui = FormApp.getUi();
  this.addMenu = function(menuName, itemName, functionName) {
    if ((null != menuName) && (null != itemName) && (null != functionName)) {
      this._ui.createMenu(menuName).addItem(itemName, functionName).addToUi();
      return this;
    } else {
      throw new Error("menuName, itemName and functionName need to be defined for Form.addMenu");
    }
  };
  
  this.addItem = function(title, row, questionType, optionsColumn, mcGridRowsColumn) {
    checkVariables({"Title": {"null": title}, "Sheet": {"object": sheet}, "Row": {"int": row}, "Column": {"int": column}}, "Form.addItem");
    switch (questionType) {
      case bellworkForm.QUESTION_TYPES.PARAGRAPH["string"]:
        this.form.addParagraphTextItem().setTitle(title);
        break;
      case bellworkForm.QUESTION_TYPES.TRUE_FALSE["string"]:
        this.form.addMultipleChoiceItem().setTitle(title).setChoiceValues(["True", "False"]);
        break;
      case bellworkForm.QUESTION_TYPES.MULTIPLE_CHOICE["string"]:
        this.form.addMultipleChoiceItem().setTitle(title);
        this.addMultiple("choice", title, sheet.getValue(row, optionsColumn));
        break;
      case bellworkForm.QUESTION_TYPES.MULTIPLE_SELECT["string"]:
        this.form.addCheckboxItem().setTitle(title);
        this.addMultiple("select", title, sheet.getValue(row, optionsColumn));
        break;
      case bellworkForm.QUESTION_TYPES.MC_GRID["string"]:
        var item = this.form.addGridItem().setTitle(title);
        item.setColumns(this.form.convertLinebreaksToList(sheet.getValue(row, optionsColumn)));
        item.setRows(this.form.convertLinebreaksToList(sheet.getValue(row, mcGridRowsColumn)));
        break;
      case bellworkForm.QUESTION_TYPES.MS_GRID["string"]:
        var item = this.form.addCheckboxGridItem().setTitle(title);
        item.setColumns(this.form.convertLinebreaksToList(sheet.getValue(row, optionsColumn)));
        item.setRows(this.form.convertLinebreaksToList(sheet.getValue(row, mcGridRowsColumn)));
        break;
      default:
        this.form.addParagraphTextItem().setTitle(title);
        break;
    }
    
  };

  this.addParagraph = function(title) {
    if (null != title) {
      this.form.addParagraphTextItem().setTitle(title);
      return this;
    } else {
      throw new Error("Title needs to be defined for Form.addParagraph");
    }
  };
  
  this.addTrueFalse = function(title) {
    if (null != title) {
      this.addMultiple("choice", title, ["True", "False"], false);
      return this;
    } else {
      throw new Error("Title needs to be defined for Form.addTrueFalse");
    }
  };
  
  this.setChoices = function(list) {
    if (null != list) {
      this.form.setChoices(list);
      return this;
    } else {
      throw new Error("List and form need to be defined for Form.setChoices");
    }
  }
  
  this.convertLinebreaksToList = function(list, form) {
    if ((null != list) && (null != form)) {
      var choices = list.split("\n");
      var arrChoices = [];
      for (var i = 0; i < choices.length; i++) {
        arrChoices.push(form.createChoice(choices[i]));
      }
      return arrChoices;
    } else {
      throw new Error("List and form need to be defined for Form.convertLinebreaksToList");
    }
  };
  
  this.addMultiple = function(type, title, items, convert) {
    if ((null != type) && (null != title) && (null != items)) {
      var mcItem = null;
      if (type == "choice") mcItem = this.form.addMultipleChoiceItem().setTitle(title);
      else mcItem = this.form.addCheckboxItem().setTitle(title);
      if (convert) items = this.setChoices(this.convertLinebreaksToList(items, mcItem));
      else mcItem.setChoiceValues(items);
      return this;
    } else {
      throw new Error("Type, title and items need to be defined for Form.addMultiple");
    }
  };

  this.addMultipleGrid = function(type, title, columns, rows) {
    if ((null != type) && (null != title) && (null != columns) && (null != rows)) {
      var mcItem = null;
      if (type == "choice") mcItem = this.form.addGridItem().setTitle(title);
      else mcItem = this.form.addCheckboxGridItem().setTitle(title);
      mcItem.setColumns(columns);
      mcItem.setRows(rows);
      return this;
    } else {
      throw new Error("Type, title, columns and rows need to be defined for Form.addMultipleGrid");
    }
  };
  
  this.addImage = function(file) {
    this.addImageItem().setImage(file);
  };
  
  this.deleteItems = function() {
    for (var i = this.form.getItems().length - 1; i >= 0; i--) {
      this.form.deleteItem(i);
    }
    this.form.deleteAllResponses();
    return this;
  };      
};

var FormEvent = function(event) {
  this.title = e.source.getTitle();
  this.date = e.response.getTimestamp();
  this.email = e.response.getRespondentEmail();
  this.response = e.response.getItemResponses()[0].getResponse();
  this.fullDate = (this.date.getMonth() + 1) + "/" + this.date.getDate() + "\n" + e.response.getItemResponses()[0].getItem().getTitle();
}
