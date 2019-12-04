function getNameFromEmail(email) {
  var name = this.email.split("@")[0].split(".");
  return [name[0].charAt(0).toUpperCase() + name[0].slice(1), name[1].charAt(0).toUpperCase() + name[1].slice(1)];  
}

function areDatesEqual(date1, date2, level) {
  if ((null == level) || (level.toUpperCase() == "YEAR")) {
    if (date1.getUTCYear() != date2.getUTCYear()) return false;
  } else if ((null != level) && (level.toUpperCase() != "DAY")) {
    if (date1.getUTCMonth() != date2.getUTCMonth()) return false;
  }
  return (date1.getUTCDate() == date2.getUTCDate());
}

function checkVariables(vars, funcName, fn) {
  for (var variable in vars) {
    var [key, value] = vars[variable];
    switch (key) {
      case "null":
        if (underscoreGS._isNull(value)) throw new Error(variable + " not defined in " + funcName);
        break;
      case "int":
        if (!underscoreGS._isNumber(value)) throw new Error(variable + " not an integer in " + funcName);
        break;
      case "object":
        if (!underscoreGS._isObject(value)) throw new Error(variable + " not an object in " + funcName);
        break;
      case "true":
        if (!underscoreGS._isBoolean(value)) throw new Error(variable + " cannot be set to that value in " + funcName);
        break;
    }
  }
  return fn;
}

var Features = function() {
  this.MULTISELECT_ENABLED = "MULTISELECT_ENABLED";
  this.MINE_ONLY = "MINE_ONLY";
  this.NAV_HIDDEN = "NAV_HIDDEN";
  this.SIMPLE_UPLOAD_ENABLED = "SIMPLE_UPLOAD_ENABLED";
  this.SUPPORT_DRIVES = "SUPPORT_DRIVES";
};

var MimeTypes = function() {
  this.DOCS = "application/vnd.google-apps.document";
  this.AUDIO = "application/vnd.google-apps.audio";
  this.DOCS = "application/vnd.google-apps.document";
  this.DRAWING = "application/vnd.google-apps.drawing";
  this.DRIVE_FILE = "application/vnd.google-apps.file";
  this.DRIVE_FOLDER = "application/vnd.google-apps.folder";
  this.FORMS = "application/vnd.google-apps.form";
  this.FUSION = "application/vnd.google-apps.fusiontable";
  this.MAPS = "application/vnd.google-apps.map";
  this.PHOTO = "application/vnd.google-apps.photo";	
  this.SLIDES = "application/vnd.google-apps.presentation";
  this.APPS_SCRIPT = "application/vnd.google-apps.script";
  this.SITES = "application/vnd.google-apps.site";
  this.SHEETS = "application/vnd.google-apps.spreadsheet";
  this.UNKNOWN = "application/vnd.google-apps.unknown";	
  this.VIDEO = "application/vnd.google-apps.video";	
  this.DRIVE_SDK = "application/vnd.google-apps.drive-sdk";
};

var DataSheet = function() {
  var sheet = DriveApp.getFilesByName(ScriptApp.getScriptId());
  if (null == sheet) sheet = SpreadsheetApp.create(ScriptApp.getScriptId());
  this.sheet = new Spreadsheet(sheet.getId());
};

var Settings = function(name, docProperties) {
  this.name_ = "SETTINGS";
  if (null != name) this.name_ = name;
  this.scriptProperties_ = true;
  this.settings_ = {};
  if (docProperties) {
    this.scriptProperties_ = false;
    this.settings_ = JSON.parse(PropertiesService.getDocumentProperties().getProperty(this.name_));
  } else {
    this.settings_ = JSON.parse(PropertiesService.getScriptProperties().getProperty(this.name_));
  }
  
  this.get = function(key) {
    if (key) {
      if (underscoreGS._isArray(key)) {
        var settingsArray = {};
        for (var i = 0; i < key.length; i++) {
          settingsArray[key[i]] = this.settings_[key[i]];
        }
        return settingsArray;
      } 
      return this.settings_[key];
    } else {
      return this.settings_;
    }
  };
  
  this.set = function(key, value) {
    if (underscoreGS._isArray(key)) {
      for (var i = 0; i < key.length; i++) {
        this.settings_[key[i]] = value;
      }
    } else {
      this.settings_[key] = value;
    }
  };
  
  this.updateProperties = function() {
    var stringifiedValues = JSON.stringify(this.settings_);
    if (this.scriptProperties_) PropertiesService.getScriptProperties().setProperty(this.name_, stringifiedValues);
    else PropertiesService.getDocumentProperties().setProperty(this.name_, stringifiedValues);
  };
  
};

function updateTriggers(formId, functionName) {
  // Update triggers for bellwork
  var triggers = ScriptApp.getUserTriggers(FormApp.openById(formId));
  for (var j = 0; j < triggers.length; j++) {
    if (triggers[j].getHandlerFunction() == functionName) ScriptApp.deleteTrigger(triggers[j]);
  }
  ScriptApp.newTrigger(functionName).forForm(formId).onFormSubmit().create();
}

