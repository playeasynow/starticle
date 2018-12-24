$.getJSON("/articles", function(data) {
  for (let i = 0; i < data.length; i++) {
    $('#articles').append(
      `<div data-id=${data[i]._id} class="card">
        <div><h3> ${data[i].title} </h3></div>
        <div> ${data[i].summary} </div>
        <div> <a target="_blank" href=${data[i].link}>Access Article</a></div>
      </div>`
    )
   
  }
});


// whenever someone clicks a p tag
$(document).on("click", ".card", function() {
  $("#notes").empty();
  let thisId = $(this).attr("data-id");

  // ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input class='form-control' id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea class='form-control mt-2' id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button class='btn mt-2 btn-primary' data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  let thisId = $(this).attr("data-id");

  // POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    .then(function(data) {
      // Log the response
      console.log(data);
      $("#notes").empty();
    });

  // remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
