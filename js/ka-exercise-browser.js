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

        $("body").append(html);

        // add to DOM
        $("#exercise-table-holder").append(html);

        // add DataTables goodness
        // $("#exercise-table").dataTable();

        // // bind click handler to preview-links
        // $("body").on("click", ".preview-link", function() {
        //     iframe.attr("src", $(this).data("url"));
        // });
    };

    loadData();
});