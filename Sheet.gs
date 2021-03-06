function test() {
  var s = new Sheets.Spreadsheets.get(spreadsheetId).sheets[0].data
}

/**
  * Gets the data from the Google Sheet.
  *
  * @param {sheetName} the name of the individual sheet to get the data for
  * @return {sheetData} the data
  */  
var Sheet = function(sheetName, spreadsheet) {
  checkVariables({"Sheet name": {"null": sheetName}}, "Sheet()");
  this._sheet = openSpreadsheet(spreadsheet).getSheetByName(sheetName);
  this._data = this._sheet.getRange(1, 1, this._sheet.getLastRow(), this._sheet.getLastColumn()).getValues();
  
  this.getValue = function(row, col) {
    return checkVariables(
      {
        "Row number": {"int": row}, 
        "Column number": {"int": col}, 
        "Row number": {"true": (row > 0)}, 
        "Column number": {"true": (col > 0)}
      }, 
      "Sheet.getValue",
      new function() {
        return this._data[row - 1][col - 1];
      }
    );
  };
  

  /**
  * Raises a number to the given power, and returns the result.
  *
  * @param {sheetName} the name of the individual sheet to get the data for
  * @param {numColumn} the number of the column
  * @return {[]} the column
  */
  this.getColumn = function(numColumn) {
    if (numColumn > 0) {
      var returnArray = [];
      for (var i = 0; i < this._data.length; i++) {
        returnArray.push(this._data[i][numColumn - 1]);
      }
      return returnArray;
    } else {
      throw new Error("numColumn must be greater than 0 in Sheet.getColumn");
    }
  }
  
  this.setRange = function(rowStart, colStart, rows, cols, value) {
    if ((rowStart > 0) && (colStart > 0) && (rows > 0) && (cols > 0)) {
      this._sheet.getRange(rowStart, colStart, rows, cols).setValues(value);
      return this;
    } else {
      throw new Error("row and column numbers need to be greater than 0 in Sheet.setValue");
    }
  }
  
  this.setValue = function(row, col, value) {
    if ((row > 0) && (col > 0)) {
      if (value) {
        this._sheet.getRange(row, col).setValue(value);
        return this;
      } else {
        throw new Error("value must be defined in Sheet.setValue");
      }
    } else {
      throw new Error("row and column numbers need to be greater than 0 in Sheet.setValue");
    }
  }
  
  this.setValues = function(startRow, startCol, numRows, numCols, value) {
    if ((numRows > 0) && (numCols > 0)) {      
      for (var i = startRow; i <= (startRow + numRows); i++) {
        for (var j = startCol; j <= (startCol + numCols); j++) {
          this.setValue(i, j, value);
        }
      }
      return this;
    } else {
      throw new Error("number of rows and number of columns needs to be greater than 0 in Sheet.setValues");
    }
  }
  
  this.skipBlankRows = function(startRow, col) {
    if (null == col) {
      while (this._sheet.getValue(startRow, col) == "") {
        startRow++;
      }
      return startRow;
    } else {
      throw new Error("Must define column to check for blank rows in Sheet.skipBlankRows");
    }
  };
  
  this.deleteRow = function(row) {
    if (row > 0) {
      this._sheet.deleteRow(row);
      return this;
    } else {
      throw new Error("row needs to be greater than 0 in Sheet.deleteRow");
    }
  }
  
  this.deleteCol = function(col) {
    if (col > 0) {
      this._sheet.deleteColumn(col);
      return this;
    } else {
      throw new Error("column needs to be greater than 0 in Sheet.deleteCol");
    }
  }
  
  this.insertCol = function(col) {
    if (col > 0) {
      this._sheet.insertColumns(col);
      return this;
    } else {
      throw new Error("column needs to be greater than 0 in Sheet.insertCol");
    }
  }

  this.getRowFromFind = function(findText) {
    if (null != findText) {
      return this._sheet.createTextFinder(findText).findNext().getRow();
    } else {
      throw new Error("findText must be defined for Sheet.getRowFromFind");
    }
  }

  this.getColumnFromFind = function(findText) {
    if (null != findText) {
      return this._sheet.createTextFinder(findText).findNext().getColumn();
    } else {
      throw new Error("findText must be defined for Sheet.getRowFromFind");
    }
  }
  
  this.getLastRow = function() {
    return this._data.length;
  }
  
  this.getLastColumn = function() {
    return this._data[0].length;
  }
  
  this.changeWorkingStatus = function(status, cell, color) {  
    if (status) {
      this.protect().setDomainEdit(false);
    } else {
      this.protect().remove();
    }
    this.setBackground(cell[0], cell[1], color);
  };

  this.setBackground = function(row, col, color) {
    this._sheet.getRange(row, col).setBackground(color);
  };
  
  this.addValuePerColumn = function(columnHeader, rowHeaders, cellValue) {
    if (!underscoreGS._isArray(rowHeaders)) rowHeaders = [rowHeaders];
    var newValueColumn = rowHeaders.length + 1;
    // If this is a new day to add bellwork, insert a new column
    if (this.getValue(1, newValueColumn) != columnHeader) {
      this.insertCol(newValueColumn - 1).setValue(1, newValueColumn, cellValue);
    }
    
    // Go through all of the rows looking for the student name
    for (var i = 2; i < this.getMaxRows(); i++) {
      
      // If we found the name of the respondent, then set the bellwork response in the response sheet
      var foundRow = true;
      for (var j = 1; j < newValueColumn; j++) {
        if (rowHeaders[j] != this.getValue(i, j)) foundRow = false;
      }
      if (foundRow) {
        this.setValue(i, newValueColumn, cellValue);
        break;
        
        // If we need to add the respondent
      } else if (this.getValue(i, 1) == "") {
        for (var j = 1; j < newValueColumn; j++) {
          this.setValue(i, j, rowHeaders[j]);
        }
        this.setValue(i, newValueColumn, cellValue);
        
        // Should I resort the sheet at this point?
        break;
      }
    }
  };
}

function openSpreadsheet(sheetInfo) {
  if (null != sheetInfo) {
    if (underscoreGS._isObject(sheetInfo)) return sheetInfo;
    return SpreadsheetApp.openById(sheetInfo);
  } else {
    return SpreadsheetApp.getActive();
  }
  throw new Error("openSpreadsheet failed.");
}

/**
 * Gets the data from a Google Sheet and provides an interface to it in an efficient way.
 *
 * @param {id} the id of the Google Sheet to use
 */
var Spreadsheet = function(id) {
  this._spreadsheet = openSpreadsheet(id);
  this._sheets = {};
  this.menus_ = {};
  
  if (null != this._spreadsheet) {
    this._allSheets = this._spreadsheet.getSheets();
    for (var i = 0; i < this._allSheets.length; i++) {
      this._sheets[this._allSheets[i].getName()] = new Sheet(this._allSheets[i].getName(), id);
    }
  } else {
    throw new Error("Could not find spreadsheet in Spreadsheet()");
  }
  
  this.getData = function(name, rowFirst) {
    var dataSheet = this.sheet.getOrCreateSheet(name);
    var data = {};
    if (rowFirst || (null == rowFirst)) {
      for (r = 1; r <= dataSheet.getLastRow(); r++) {
        var rowData = {};
        for (c = 1; c <= dataSheet.getLastColumn(); c++) {
          rowData[dataSheet.getValue(0, c)] = dataSheet.getValue(r, c);
        }
        data[dataSheet.getValue(r, 0)] = rowData;
      }
    } else {
      for (c = 1; c <= dataSheet.getLastColumn(); c++) {
        var columnData = {};
        for (r = 1; r <= dataSheet.getLastRow(); r++) {
          columnData[dataSheet.getValue(r, 0)] = dataSheet.getValue(r, c);
        }
        data[dataSheet.getValue(0, c)] = columnData;
      }
    }
    return data;
  };
  
  
  this.getOrCreateSheet = function(sheetName) {
    if (null != sheetName) {
      if (this.hasSheet(sheetName)) {
        return this.getSheet(sheetName);
      } else {
        var newSheet = this._spreadsheet.insertSheet(sheetName);
        this._sheets[sheetName] = new Sheet(sheetName, this._spreadsheet.getId());
      }
    } else {
      throw new Error("Sheet name not defined in Spreadsheet.getOrCreateSheet");
    }
  };
  
  this.createSheet = function(sheetName) {
    if (null != sheetName) {
      var sheet = this._spreadsheet.insertSheet(sheetName);
      if (null == sheet) return false;
      return true;
    } else {
      throw new Error("Sheet name not defined in Spreadsheet.createSheet");
    }
  };
  
  this.hasSheet = function(sheetName) {
    if (null != sheetName) {
      var sheet = this._sheets[sheetName];
      if (null == sheet) return false;
      return true;
    } else {
      throw new Error("Sheet name not defined in Spreadsheet.hasSheet");
    }
  };
  
  this.getSheet = function(sheetName) {
    if (null != sheetName) {
      var sheet = this._sheets[sheetName];
      if (null != sheet) {
        return sheet;
      } else {
        throw new Error("Could not find sheet named " + sheetName + " in Spreadsheet.getSheet");
      }
    } else {
      throw new Error("Sheet name not defined in Spreadsheet.getSheet");
    }
  };
  
  this._ui = SpreadsheetApp.getUi();
  this.addMenu = function(menuName, itemName, functionName) {
    if ((null != menuName) && (null != itemName) && (null != functionName)) {
      if (menuName in this.menus_) {
        this.menus_[menuName].addItem(itemName, functionName).addToUi();
      } else {
        this.menus_[menuName] = this._ui.createMenu(menuName).addItem(itemName, functionName);
        this.menus_[menuName].addToUi();
      }
      return this;
    } else {
      throw new Error("One of menuName, itemName or functionName is not defined in Spreadsheet.addMenu");
    }
  };
  
  this._triggerRanges = {
    "columns": [],
    "rows": []
  };
  
  // Will triggers work in a library?
  this.addTrigger = function(triggerType, sheetName, functionName) {
    if ((null != triggerType) && (null != sheetName) && (null != functionName)) {
      var sheet = this._allSheets[sheetName];
      if (null != sheet) {
        switch (triggerType) {
          case ScriptApp.EventType.ON_CHANGE:
            ScriptApp.newTrigger(functionName).forSpreadsheet(sheet).onChange().create();
          case ScriptApp.EventType.ON_EDIT:
            ScriptApp.newTrigger(functionName).forSpreadsheet(sheet).onEdit().create();
          case ScriptApp.EventType.ON_FORM_SUBMIT:
            ScriptApp.newTrigger(functionName).forSpreadsheet(sheet).onFormSubmit().create();
        }
        
        return this;
      } else {
        throw new Error("Sheet name is incorrect or not found in Spreadsheet.addTrigger");
      }
    } else {
      throw new Error("One of triggerType, sheetName or functionName is not defined in Spreadsheet.addTrigger");
    }
  };
  
  this._triggerSheet = "";
  this.addSheetName = function(name) {
    if (null != name) {
      this._triggerSheet = name;
      return this;
    } else {
      throw new Error("Sheet name is not found in Spreadsheet.addSheetName");
    }
  };
  
  this.addTriggerColumnRange = function(min, max) {
    this.addTriggerRange("columns", min, max);
  };
  
  this.addTriggerRowRange = function(min, max) {
    this.addTriggerRange("rows", min, max);
  };
  
  this.addTriggerRange = function(type, min, max) {
    if (null != type) {
      if (null != min) {
        if (isArray(min)) {
          for (var i = 0; i < min.length; i++) {
            if (isArray(max)) {
              for (var j = 0; j < max.length; j++) {
                this._triggerRanges[type].push([min[i], max[j]]);
              }
            } else {
              if (null != max) this._triggerRanges[type].push([min[i], max]);
              else this._triggerRanges[type].push([min[i], min[i]]);
            }
          }
        } else {
          if (null != max) this._triggerRanges[type].push([min, max]);
          else this._triggerRanges[type].push([min, min]);
        }
      } else {
        throw new Error("min cannot be greater than max and must be greater than or equal to zero in Spreadsheet.addRange");
      }
    } else {
      throw new Error("type needs to be defined in Spreadsheet.addRange");
    }
    
    return this;
  };
}

var SheetEvent = function(event) {
  this.sheet = new Sheet(event.source.getActiveSheet().getSheetName(), event.source.getActiveSheet().getSheetId());
  this.sheetName = event.source.getActiveSheet().getName();
  this.row = event.range.getRow();
  this.column = event.range.getColumn();
  this.value = event.range.getValue();
  return this;
}