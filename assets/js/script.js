var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);

  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
  //'this' keyword that lets objects refer to themselves.
  var text = $(this)
  .text()
  .trim();
  
  //this tells jQuery to make a new textarea element
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);

  //replaces the p element with a textarea that we created in the textInput variable.
  $(this).replaceWith(textInput);

  // "focus" is a highlighted element and with trigger we can highlight it automatically
  textInput.trigger("focus");
});

// blur an event that happens when an object loses focus
$(".list-group").on("blur", "textarea", function () {
//get the textarea's current value/text
var text = $(this)
  .val()
  .trim();

//get the parent's ul's id attribute
//Here, we're chaining it to attr(), which is returning the ID, which will be "list-" followed by the category. We're then chaining that to .replace() to remove "list-" from the text, which will give us the category name (e.g., "toDo") that will match one of the arrays on the tasks object (e.g., tasks.toDo).
var status = $(this)
.closest(".list-group")
.attr("id")
.replace("list-", "");

// get the task's posistion in the list of other elements
var index = $(this)
.closest(".list-group-item")
.index();

tasks[status][index].text= text;
saveTasks();

// recreate p element
var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

//due date was clicked
$(".list-group").on("click", "span", function (){
  //get current text
  var date = $(this)
  .text()
  .trim();

  //create new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      //when calendar is closed, force a "change" on the 'dateInput'
      $(this).trigger("change");
    }
  });

  //automatically focus on new element
  dateInput.trigger("focus");
});

//value of due date was changed
$(".list-group").on("change", "input[type='text']", function(){
  //get current text
  var date = $(this)
  .val()
  .trim();

  // get the parent ul's of id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// sortable list functions. Sortable turned every element with the class list-group into a sortable list.
$(".card .list-group").sortable({
  // connectWith links the sortable lists with any other lists with the same class.
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
    $(".bottom-trash").removeClass("dropover-trash-active");
  },
  update: function(event) {
    //array to store the task data in
    var tempArr = [];

    //loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    //trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

$("#modalDueDate").datepicker({
  minDate: 1
});

var auditTask = function(taskEl) {
  console.log(taskEl);
  //get date from task element
  var date = $(taskEl).find("span").text().trim();

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  
  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if taskis near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance:"touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();

setInterval(function () {
  $(".card .list-group-item").each(function (el) {
    auditTask(el);
  });
}, 1800000);
