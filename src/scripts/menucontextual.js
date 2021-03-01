function subItem(name, fn) {
    return $("<li>")
        .attr({
            "data-animate-dropdown-item": true,
            "tabindex": "-1"
        })
        .click(fn)
        .mouseover(function () {
            $(this).css({
                backgroundColor: "#f4f5f5"
            })
        })
        .mouseleave(function () {
            $(this).css({
                backgroundColor: ""
            })
        })
        .css({
            opacity: 1,
            transform: "translateY(0px)"
        })
        .append(
            $("<div>")
                .css({
                    "padding-left": "24px",
                    "padding-right": "58px",
                    "cursor": "pointer",
                    "padding-top": "13px",
                    "flex-grow": 1,
                    "overflow": "hidden",
                    "text-overflow": "ellipsis",
                    "white-space": "nowrap",
                    "box-sizing": "border-box",
                    "color": "#444444",
                    "display": "block",
                    "font-size": "14.5px",
                    "height": "40px",
                    "line-height": "14.5px"
                })
                .attr({
                    title: name,
                    role: "button"
                })
                .text(name)
        )
}

function showMenuWD(event) {

    createMenu(event);


}

$.fn.contextMenu = function (options) {
    let defaults = {
        actions: []
    }
    defaults = $.extend({}, defaults, options);

    $("*:NOT(.ignoreMenuEvent)").addClass("ignoreMenuEvent").on("click contextmenu", function (evt) {
        if (evt.type == "contextmenu" && $(`[menuEvent="true"]`).is(evt.target)) {

        } else {
            $("#menuWD").hide();
        }
    })

    return $(this).each(function () {
        if ($("#menuWD").length == 0) {
            $("#app").append(
                $("<div>")
                    .attr("id", "menuWD")
                    .css({
                        "transform-origin": "left top 0px",
                        "transform": "scale(1)",
                        "opacity": 1,
                        "background-color": "white",
                        "border-radius": "3px",
                        "box-shadow": "0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16)",
                        "padding": "9px 0px",
                        "max-width": "340px",
                        "overflow": "hidden",
                        "position": "absolute",
                        "z-index": 10000,
                        "display": "none"
                    })
                    .append(
                        $("<ul>")
                            .attr("menuactions", "true")
                    )
            )
        }

        if (!$(this).attr("menuEvent")) {
            $(this).attr("menuEvent", true);
            $(this).on("contextmenu", function (event) {
                $("#menuWD [menuactions]").empty();
                $.each(defaults.actions, (i, e) => {
                    if(e.condition && !e.condition()) return;
                    $("#menuWD [menuactions]").append(subItem(e.name, e.fn));
                });
                let x = event.pageX + 2
                if ($(window).width() < ($("#menuWD").width() + event.pageX + 2)) {
                    x = event.pageX - $("#menuWD").width();

                }
                $("#menuWD").show();
                $("#menuWD").css({
                    "left": `${x}px`,
                    "top": `${(event.pageY) - ($("#menuWD").height() + 13)}px`
                })
            });
        }
    })


}