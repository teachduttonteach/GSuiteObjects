function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

/**
 * Raises a number to the given power, and returns the result.
 *
 * @param {number} base the number we're raising to a power
 * @param {number} exp the exponent we're raising the base to
 * @return {number} the result of the exponential calculation
 */
var Picker = function() {
  this.pickerSettings = new Settings("PICKER");
  
  this.setDoc = function(dialogName, id) {
    var s = new Settings();
    s.set(dialogName, id);
  }
  
  this.show = function(dialogText, dialogName) {
    var m = new MimeTypes();
    var f = new Features();
    this.pickerSettings.set("DIALOG_WIDTH", 600);
    this.pickerSettings.set("DIALOG_HEIGHT", 425);
    this.pickerSettings.set("INCLUDE_FOLDERS", true);
    this.pickerSettings.set("MIME_TYPES", [m.DOCS,m.DRIVE_FILE]);
    this.pickerSettings.set("FEATURES", [f.MULTISELECT_ENABLED]);
    
    var template = HtmlService.createTemplateFromFile('PickerBox.html');
    template.data = this.pickerSettings.get();
    template.data["SELECTED_DOCUMENT"] = dialogName;
    var html = template.evaluate().setWidth(this.pickerSettings.get("DIALOG_WIDTH")).setHeight(this.pickerSettings.get("DIALOG_HEIGHT"));
    Logger.log(html.getContent());
    return SpreadsheetApp.getUi().showModalDialog(html, dialogText);
  }
};

/**
 * Displays a sidebar.
 */
var Sidebar = function() {
  var htmlOutput = HtmlService
    .createHtmlOutput('<p>A change of speed, a change of style...</p>')
    .setTitle('My add-on');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}