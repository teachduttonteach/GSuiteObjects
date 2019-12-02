var Classroom = function() {
  this.classList = Classroom.Courses.list().courses;
}

var Class = function(title, courses) {
  this.id = null;
  for (var k = 0; k < courses.length; k++) {
    if (courses[k].name == title) this.id = courses.id;
  }
  if (this.id == null) throw new Error("Could not find class '" + title + "' in class list");
  
  this.courseWork = this.courses.CourseWork.list(this.id, {orderBy: "dueDate asc"}).courseWork;
  this.announcements = this.courses.Announcements.list(this.id, {orderBy: "dueDate asc"}).announcements;
  this.topics = this.courses.Topics.list(this.id).topic;
  
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
            for (var k = 0; k < materials.length; k++) {
              arrMaterials.title = materials[k]["title"];
              if (materials[k]["driveFile"]) arrMaterials.file = materials[k]["driveFile"]["driveFile"];
              else if (materials[k]["youtubeVideo"]) arrMaterials.video = materials[k]["youtubeVideo"];
              else if (materials[k]["link"]) arrMaterials.link = materials[k]["link"];
              else if (materials[k]["form"]) arrMaterials.form = materials[k]["form"];
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

