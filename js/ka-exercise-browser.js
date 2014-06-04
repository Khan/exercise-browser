$(function() {
    var key = "exercises";
    var site = "https://www.khanacademy.org"; // znd-exercises-topics-dot-khan-academy.appspot.com
    var url = site + "/api/v1/" + key;

    // handlebars stuff
    var tmpl = Handlebars.compile($("#exercise-boxes-tmpl").html());

    var fetchData = function() {
        $.ajax({
            url: url,
            dataType: "jsonp",
            success: function(data, textStatus, jqXHR) {
                var now = moment();

                data = _.map(data, function(exercise) {
                    var date = exercise["creation_date"];
                    exercise["is_new"] = false;

                    if (date) {
                        date = date.substring(0, 10);
                        exercise["creation_date"] = date;

                        // add "NEW!" span if the exercise was published
                        // less than two months ago
                        var day = moment(date, "YYYY-MM-DD");
                        var daysAgo = now.diff(day, "days");
                        if (daysAgo <= 60) {
                            exercise["is_new"] = true;
                        }
                    }
                    return exercise;
                });

                // set time-to-live to 5 hours
                // 5 hrs * 60 min/hr * 60 seconds/min * 1000 ms/min
                var ttl = 5 * 60 * 60 * 1000;
                $.jStorage.set(key, data, {
                    TTL: ttl
                });

                loadData();
            }
        });
    };

    var loadData = function() {
        var exercises = $.jStorage.get(key);
        if (!exercises) {
            fetchData();
            return;
        }

        var html = tmpl({"exercises": exercises});

        // add to DOM
        $("#exercise-list-holder .loading-bar").css("display", "none");
        $("#exercise-list").html(html);

        var fuzzyOptions = {
            searchClass: ".search",
            location: 0,
            distance: 100,
            threshold: 0.2,
            multiSearch: true
        };

        // add listjs goodness
        var options = {
            valueNames: ["display-name"],
            plugins: [
                [ "fuzzySearch", fuzzyOptions ]
            ]
        };

        var exerciseList = new List("exercise-list-holder", options);

        var searchbar = $(".search");

        // disable fuzzy search for now
        // searchbar.keyup(function() {
        //     exerciseList.fuzzySearch($(this).val());
        // });

        // disable typeahead for now
        // searchbar.typeahead({
        //     source: _.pluck(exercises, "display_name")
        // });

        var preview = $("#myModal");
        var modalTitle = $("#myModalLabel");
        var iframe = $("iframe.exercise-preview");
        var baseUrl = "./khan-exercises/exercises/";
        var body = $("body");

        preview.modal({
            show: false
        });

        $(".boxes").on({
            mouseover: function(e) {
                $(this).find(".toolbar").css("visibility", "visible");
            },

            mouseout: function(e) {
                $(this).find(".toolbar").css("visibility", "hidden");
            }
        }, ".box");

        $(".boxes").on("click", ".box .screenshot", function() {
            var box = $(this).parents(".box");
            var relativeUrl = box.data("filename");
            iframe.attr("src", baseUrl + relativeUrl + "?browse");
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
    };

    loadData();
});
