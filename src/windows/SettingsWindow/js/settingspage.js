const { ipcRenderer } = require("electron");
const $ = require("jquery");
let settings;
ipcRenderer.on("settings", (evt, sett) => {
    settings = sett.settings;
    if (settings) {
        for (let ktag in settings) {
            let element = settings[ktag];
            let divTag = $(`#${element.section}`);
            if (!$(`.tabsHeaders li[rel='${element.section}']`).length) {
                $(".tabsHeaders").append(
                    $(`<li>`)
                        .attr({
                            rel: element.section
                        })
                        .click(function () {
                            let id = $(this).attr("rel");
                            $(this).parent().find("li.active").remove("active");
                            $(this).addClass("active");
                            $(this).parent().parent().find(`.tab`).css({ display: "none" });
                            $(this).parent().parent().find(`#${id}.tab`).css({ display: "flex" });
                        })
                        .text(element.section)
                );
                divTag = $("<div>")
                divTag.addClass("tab");
                divTag.attr("id", element.section);
                $(".tabsContainer").append(divTag);
            }

            switch (element.type) {
                case "CHECKBOX":
                    divTag.append(
                        $("<div>")
                            .addClass("row")
                            .append(
                                $("<label>")
                                    .addClass("label-form")
                                    .append(element.text)
                                    .append("<br>")
                                    .append(
                                        $("<span>")
                                            .addClass("tiny")
                                            .append(element.tinyText)
                                    )
                            )
                            .append(
                                $("<input>")
                                    .addClass("input-form")
                                    .attr({
                                        name: ktag,
                                        type: "checkbox"
                                    })
                                    .prop("checked", element.value)
                            )
                    )
                    break;
                case "INPUT":
                    divTag.append(
                        $("<div>")
                            .addClass("row")
                            .append(
                                $("<label>")
                                    .addClass("label-form")
                                    .append(element.text)
                                    .append("<br>")
                                    .append(
                                        $("<span>")
                                            .addClass("tiny")
                                            .append(element.tinyText)
                                    )
                            )
                            .append(
                                $("<input>")
                                    .addClass("input-form")
                                    .attr({
                                        name: ktag,
                                    })
                                    .val(element.value)
                            )
                    )
                    break;
                case "TEXTAREA":
                    divTag.append(
                        $("<div>")
                            .addClass("row")
                            .append(
                                $("<label>")
                                    .addClass("label-form")
                                    .append(element.text)
                                    .append("<br>")
                                    .append(
                                        $("<span>")
                                            .addClass("tiny")
                                            .append(element.tinyText)
                                    )
                            )
                            .append(
                                $("<textarea>")
                                    .addClass("input-form")
                                    .attr({
                                        name: ktag
                                    })
                                    .val(element.value)
                            )
                    )
                    break;
                case "SELECT":
                    divTag.append(
                        $("<div>")
                            .addClass("row")
                            .append(
                                $("<label>")
                                    .addClass("label-form")
                                    .append(element.text)
                                    .append("<br>")
                                    .append(
                                        $("<span>")
                                            .addClass("tiny")
                                            .append(element.tinyText)
                                    )
                            )
                            .append(
                                $("<select>")
                                    .addClass("input-form")
                                    .attr({
                                        name: ktag,
                                    })
                                    .append(
                                        element.options.map(e=>{
                                            return $("<option>")
                                            .val(e.key)
                                            .text(e.text)
                                        })
                                    )
                                    .val(element.value)
                            )
                    )
                    break;
            }

        }
        $(".tabsHeaders li:first").click();
    }
    /* if(settings){
        $.each(settings,(tabname,tab)=>{
            $.each(tab,(name,val)=>{
                let el = $(`#${tabname} [name="${name}"]`);
                if(el.attr("type") == "checkbox"){
                    el.prop("checked",val);
                }else{
                    el.val(val);
                }
            })
        })
    } */
    /* $("input[requireReboot],select[requireReboot]").each(function(){
        let val = ($(this).attr("type")=="checkbox"?$(this).is(":checked"):$(this).val());
        $(this).data("ori-value",val);  
    }) */
})
$(document).ready(() => {
    $("input[requireReboot],select[requireReboot]").change(function () {
        let val = ($(this).attr("type") == "checkbox" ? $(this).is(":checked") : $(this).val());
        if ($(this).data("ori-value") != val) {
            alert("Some configurations require to reboot the app");
        }
    });
    $("#Accept").on("click", () => {
        let data = {};
        let requireReboot = false;
        $("input,select").each((i, e) => {
            data[$(e).attr("name")] = ($(e).attr("type") == "checkbox" ? $(e).is(":checked") : $(e).val());
        })
        if (requireReboot) {

        }
        save(data);
    })
    $("#Cancel").on("click", () => {
        save(null);
    });
    ipcRenderer.send("getData", true);
})

function save(data) {
    console.log(data);
    ipcRenderer.send("send", data);
}