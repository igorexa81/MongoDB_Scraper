$.getJSON("/articles", (data) => {
    // for each one
    for (let i = 0; i < data.length; i++) {
        // Display the article information on the page
        $("#articles").append(`<p data-id='${   data[i]._id  }'>${  data[i].title  }<br />${  data[i].link  }<br />${  data[i].summary  }</p`)
    }
});
// When pressing the scrape button
$(document).on("click", "#getArticles", () => {
    $('#load').css("visibility", "visible");
});


$(document).on("click", "p", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    const thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: `/articles/${  thisId}`
        })
        // now, add the note information to the page
        .then((data) => {
            // The title of the article
            $("#notes").append(`<h2> + ${data.title} + </h2>`)
            $("#notes").append(`<input id='titleInput' name='title' >`)
            $("#notes").append(`<textarea id='bodyInput' name='body'></textarea>`);
            $("#notes").append(`<button class='btn btn-secondary' data-id=${data._id} id='savenote'>Save Note</button>`)
            $("#notes").append(`<button class='btn btn-secondary' data-id=${data._id} id='deletenote'>Delete Note</button>`)


            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $('#titleInput').val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyInput").val(data.note.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    const thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: `/articles/${  thisId}`,
            data: {
                // Value taken from title input
                title: $("#titleInput").val(),
                // Value taken from note textarea
                body: $("#bodyInput").val()
            }
        })
        .then((data) => {
            // Empty the notes section
            $("#notes").empty();
        });

    // remove the values entered in the input and textarea for note entry
    $("#titleInput").val("");
    $('#bodyInput').val("");
});

$(document).on("click", "#deletenote", function (event) {

    // Grab the id associated with the article from the submit button
    const thisId = $(this).attr("data-id");

    $.ajax({
            method: "DELETE",
            url: `/articles/${thisId}`,
            success(data) {},
            error(err) {
                console.log(err);
            }
        })
        .then((data) => {
            $("#titleInput").val("");
            $("#bodyInput").val("");
            $("#notes").empty();
        })
});


// save article button on click
    // this will send the ajax call to the post that will put the passed in object into the database
    $('.save-button').on('click', function () {
        let id = ($(this).data('id'));
        let title = ($(this).data('title'));
        let link = ($(this).data('link'));
        let summary = ($(this).data('summary'));

        let savedArticle = {
            title: title,
            link: link,
            summary: summary
        };

        $.post("/save/" + id, savedArticle)
            .then(function () {
                console.log('article saved to saved articles')
            });
        location.reload();
    });



    // delete saved article on click
    // this will send the ajax call to the post that will delete the article matching the id
    // it will also pass in an object of the deleted article to put back into the all articles database
    $('.delete-article-button').on('click', function () {
        let id = ($(this).data('id'));
        let title = ($(this).data('title'));
        let link = ($(this).data('link'));
        let summary = ($(this).data('summary'));

        let articleToPutBack = {
            title: title,
            link: link,
            summary: summary
        };

        $.ajax({url: '/saved/' + id, type: 'DELETE'})
            .then(function () {
                console.log('article saved to all articles')
            });
        location.reload();
    });

