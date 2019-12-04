var Classroom = function() {
  this.classList = Classroom.Courses.list().courses;
  
  this.getClass = function(title) {
    for (var k = 0; k < this.classList.length; k++) {
      if (this.classList[k].name == title) return new Class(this.classList[k]);
    }
  }
}

var Class = function(course) {
  if (course == null) throw new Error("Could not find class in class list");
  this.class = course;
  
  this.courseWork = this.courses.CourseWork.list(this.class.id, {orderBy: "dueDate asc"}).courseWork;
  this.announcements = this.courses.Announcements.list(this.class.id, {orderBy: "dueDate asc"}).announcements;
  this.topics = this.courses.Topics.list(this.class.id).topic;
  
  this.getCalendarId = function() {
    return this.class.calendarId;
  };
  
  this.convertClassroomData = function() {
    var objClassroomData = {};
    for (var i = 0; i < this.topics.length; i++) {
      var topic = this.topics[i];
      objClassroomData[topic] = {
        announcements: {
          level: 2,
          titles: []
        },
        courseWork: {
          level: 2,
          titles: [],
        },
        
      };
      for (var j = 0; j < this.announcements.length; j++) {
        if (this.announcements[j]["topicId"] == this.topics[i]["topicId"]) {
          objClassroomData[topic].announcements.titles.push(this.announcements[j]["title"]);
        }
      }
      for (var j = 0; j < this.courseWork.length; j++) {
        if (this.courseWork[j]["topicId"] == this.topics[i]["topicId"]) {
          var objWork = {
            title: this.courseWork[j]["title"]
          };
          if (this.courseWork[j]["dueDate"]) {
            objWork.dueDate = "Due Date: " + this.courseWork[j]["dueDate"]["month"] + "/" + this.courseWork[j]["dueDate"]["day"] + "/" + this.courseWork[j]["dueDate"]["year"];
          }
          if (this.courseWork[j]["description"]) {
            objWork.description = this.courseWork[j]["description"];
          }
          if (this.courseWork[j]["materials"]) {
            var arrMaterials = {};
            for (var k = 0; k < this.materials.length; k++) {
              arrMaterials.title = this.materials[k]["title"];
              if (this.materials[k]["driveFile"]) arrMaterials.file = this.materials[k]["driveFile"]["driveFile"];
              else if (this.materials[k]["youtubeVideo"]) arrMaterials.video = this.materials[k]["youtubeVideo"];
              else if (this.materials[k]["link"]) arrMaterials.link = this.materials[k]["link"];
              else if (this.materials[k]["form"]) arrMaterials.form = this.materials[k]["form"];
            }
            objWork.materials = arrMaterials;
          }
          objClassroomData[topic].courseWork.titles.push(objWork);
        }
      }
    }
    return objClassroomData;
  };
};

