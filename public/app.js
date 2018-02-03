// // Load results onto page
// function getResults() {
//     // empty any results currently on page
//     $("#results").empty();

//     // grab all of the current notes
//     $.getJSON("/all", function(data) {
//         // for each headline...
//         for (var i = 0; i < data.length; i++) {
//             // ...populate #results with a p-tag that includes the note's title and object id
//             $("#results").prepend("<p class='dataentry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" + data[i]._id + ">" + data[i].title + "</span></p>");
//         }
//     });
// }

// getResults();

$(document).on("click", "#makenote", function() {

    // AJAX POST call to submit route with button
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/submit",
        data: {
            inputNotes: $("#inputNotes").val()
        }
    }).done(function(data) {
        $("#inputNotes").val("");
    })
});

$(document).on("click", "#scrape-btn", function() {
    // AJAX GET call to get the data from the site
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "'http://localhost:3035/scrape'",
        dataType: 'jsonp',
        jsonp: 'jsonp',
        success: function(data) {
            console.log('success', data);
        },
        error: function(error) {
            console.log(error);
        }
    })
});

$(document).on("click", "#deleteart", function() {
    // Saves the div card-header? tag that encloses the button
    var selected = $(this).parent();

    // AJAX get request to delete the article
    $.ajax({
        type: "GET",
        url: "/delete/" + selected.attr("data-id"),

        // on successful call
        success: function(response) {
            // remove the p-tag from the DOM
            selected.remove();
        }
    });
});