$(function() {
    var key = "exercises";
    var site = "http://www.khanacademy.org"; // znd-exercises-topics-dot-khan-academy.appspot.com
    var url = site + "/api/v1/" + key;

    // handlebars stuff
    var tableTmpl = Handlebars.compile($("#exercise-table-tmpl").html());
    var thumbTmpl = Handlebars.compile($("#exercise-thumb-tmpl").html());

    // var iframe = $("#exercise-preview");

    var fetchData = function() {
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
            },
            error: function() {
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

        // add to DOM
        $("#holder").append(html);

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

        var exerciseList = new List("exercise-list", options);

        var searchbar = $(".search");

        searchbar.keyup(function() {
            exerciseList.fuzzySearch($(this).val());
        });

        // searchbar.typeahead({
        //     source: _.pluck(exercises, "display_name")
        // });

        var preview = $("#myModal");
        var modalTitle = $("#myModalLabel");
        var iframe = $("iframe.exercise-preview");
        var baseUrl = "/khan-exercises/exercises/";
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

        $(".boxes").on("click", ".box .preview-btn", function() {
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