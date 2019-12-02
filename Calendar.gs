var Calendar = function(id) {
  this.id = id;
  this.ONE_DAY = 24*60*60*1000;
  this.dateToday = new Date();
  this.endDate = new Date();
  
  var getUpcomingEvents = function(daysToLookAhead) {
    this.endDate.setMilliseconds(this.dateToday.getMilliseconds() + (daysToLookAhead * this.ONE_DAY));
    var upcomingEvents = CalendarApp.getCalendarById(this.id).getEvents(this.dateToday, this.endDate);
    for (var event in upcomingEvents.length) {
      var dateOfEvent = event.getEndTime();
      dateOfEvent.setUTCDate(dateOfEvent.getUTCDate() - 1);
      dateOfEvent.setMilliseconds(dateOfEvent.getMilliseconds() - 1);
      var monthOfEvent = dateOfEvent.getMonth() + 1;
    }
    return upcomingEvents;
  };
  
}
