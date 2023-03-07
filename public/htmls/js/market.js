// alert("script running");

$(document).ready(function ($) {
    var alterClass = function () {
        var ww = document.body.clientWidth;
        if (ww >= 990) {
            $('#accordionCategories').removeClass('accordion');
            $('.accordion-collapse').addClass('show');
        } else {
            $('#accordionCategories').addClass('accordion');
            $('.accordion-collapse').removeClass('show');
        };
    };
    $(window).resize(function () {
        alterClass();
    });
    //Fire it when the page first loads:
    alterClass();
});