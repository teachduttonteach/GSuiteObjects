var Calendar = function(id) {
  this.id = id;
  this.ONE_DAY = 24*60*60*1000;
  this.dateToday = new Date();
  this.endDate = new Date();
  this.upcomingEventObjects = [];
  
  var getUpcomingEvents = function(daysToLookAhead) {
    this.endDate.setMilliseconds(this.dateToday.getMilliseconds() + (daysToLookAhead * this.ONE_DAY));
    var upcomingEvents = CalendarApp.getCalendarById(this.id).getEvents(this.dateToday, this.endDate);
    for (var event in upcomingEvents.length) {
      this.upcomingEventObjects.push(new CalendarEvent(event));
    }
    return this.upcomingEventObjects;
  };
  
}

var CalendarEvent = function(event) {
  this.event = event;
  this.date = event.getEndTime();
  this.date.setUTCDate(this.date.getUTCDate() - 1);
  this.date.setMilliseconds(this.date.getMilliseconds() - 1);
  this.month = event.getMonth() + 1;
  this.title = event.getTitle();

  var getDate = function(order, dateDelim, titleDelim) {
    var dateString = titleDelim + this.title;
    if (order == "MD") {
      return this.month + dateDelim + this.date + dateString;
    } else if (order == "DM") {
      return this.date + dateDelim + this.month + dateString;
    }
  };
}
