$(function() {
    var key = "exercises";
    var url = "http://www.khanacademy.org/api/v1/" + key;

    // handlebars stuff
    var tableTmpl = Handlebars.compile($("#exercise-table-tmpl").html());
    var thumbTmpl = Handlebars.compile($("#exercise-thumb-tmpl").html());

    // var iframe = $("#exercise-preview");

    var fetchData = function() {
        console.log("fetch data called");
        $.ajax({
            url: url,
            success: function(data, textStatus, jqXHR) {

                data = _.map(data, function(exercise) {
                    var date = exercise["creation_date"];
                    date = date.substring(0, 10);
                    exercise["creation_date"] = date;
                    return exercise;
                    // var day = moment(date, "YYYY-MM-DD");
                });

                // set time-to-live to 5 hours
                // 5 hrs * 60 min/hr * 60 seconds/min * 1000 ms/min
                var ttl = 5 * 60 * 60 * 1000;
                $.jStorage.set(key, data, {
                    TTL: ttl
                });

                loadData();

                console.log("fetched data!");
            },
            error: function() {
                console.log("failed to get data from server!");
            }
        });
    };

    var tmpl = thumbTmpl;

    var loadData = function() {
        var exercises = $.jStorage.get(key);
        if (!exercises) {
            fetchData();
            return;
        }

        var html = tmpl({"exercises": exercises});

        // $("body").append(html);

        // add to DOM
        $("#exercise-table-holder").append(html);

        // add listjs goodness
        var options = {
            valueNames: ["display-name", "creation-date", "author-name"],
            plugins: [
                [ "fuzzySearch" ]
            ]
        };

        var exerciseList = new List("exercise-list", options);

        var searchbar = $(".search");

        searchbar.keyup(function() {
            exerciseList.fuzzySearch($(this).val());
        });

        searchbar.typeahead({
            source: _.pluck(exercises, "display_name")
        });

        var preview = $("#myModal");
        var modalTitle = $("#myModalLabel");
        var iframe = $("iframe.exercise-preview");
        var baseUrl = "/khan-exercises/exercises/";
        var body = $("body");

        preview.modal({
            show: false
        });

        $(".thumbnails").on("click", ".thumbnail", function(e) {
            var relativeUrl = $(this).data("filename");
            iframe.attr("src", baseUrl + relativeUrl + "?debug");

            var title = $(this).data("name");
            modalTitle.html(title);
            preview.modal("show");
        });

        var modalCover = $(".modal-body-cover");

        modalCover.on("scroll", function(e){
            e.preventDefault();
        });

        preview.on("shown", function() {
            body.css({ overflow: "hidden" });
        });

        preview.on("hidden", function() {
            body.css({ overflow: "inherit" });
        });

        // add DataTables goodness
        // $("#exercise-table").dataTable();

        // // bind click handler to preview-links
        // $("body").on("click", ".preview-link", function() {
        //     iframe.attr("src", $(this).data("url"));
        // });
    };

    loadData();
});