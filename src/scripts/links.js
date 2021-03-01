const $ = require('jquery');
const { shell } = require('electron');
function load() {
    $(".focusable-list-item:NOT(.ignoreClickWD)").each(function (i, e) {
        $(e)
            .addClass("ignoreClickWD")
            .click(function () {
                $(`div.copyable-text.selectable-text[contenteditable="true"]`).contextMenu({
                    actions: [
                        {
                            name: "Copy",
                            fn: function () {
                                document.execCommand("copy");

                            },
                            condition:function(){
                                let t = '';
                                if (window.getSelection) {
                                    t = window.getSelection();
                                } else if (document.getSelection) {
                                    t = document.getSelection();
                                } else if (document.selection) {
                                    t = document.selection.createRange().text;
                                }
                                return t.type == "Range" && $(`div.copyable-text.selectable-text[contenteditable="true"]`).is(t.focusNode.parentNode);
                            }
                        },
                        {
                            name: "Cut",
                            fn: function () {
                                document.execCommand("cut");
                            },
                            condition:function(){
                                let t = '';
                                if (window.getSelection) {
                                    t = window.getSelection();
                                } else if (document.getSelection) {
                                    t = document.getSelection();
                                } else if (document.selection) {
                                    t = document.selection.createRange().text;
                                }
                                return t.type == "Range" && $(`div.copyable-text.selectable-text[contenteditable="true"]`).is(t.focusNode.parentNode);
                            }
                        },
                        {
                            name: "Paste",
                            fn: function () {
                                document.execCommand("paste");

                            }
                        }
                    ]
                });
            });

    })
}

function checkLoad() {
    $("body").on("DOMSubtreeModified", ()=>{
        if ($(`.copyable-text.selectable-text[dir]`).length > 0) {
            
            /* $(document).off("DOMSubtreeModified"); */
            load();
            //_onafterload();
        }
    });
}
checkLoad();