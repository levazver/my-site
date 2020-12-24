import {enable} from '../config';

if (enable.components.wysiwyg === true) {
    const $wysiwyg = $('.js-wysiwyg');

    // Img
    $wysiwyg
        .find('img')
        .each(function () {
            $(this).removeAttr('width height');
        });

    $wysiwyg
        .find('> p > img')
        .each(function () {
            $(this).unwrap();
        });

    // Video (Youtube, Vimeo)
    $wysiwyg
        .find('> iframe[src*="vimeo"], > iframe[src*="youtube"]')
        .each(function () {
            $(this).wrap('<div class="wysiwyg__video"/>');
        });


    // Enable fancybox gallery for all img in wysiwyg
    $wysiwyg
        .find('img')
        .each(function (index,elem) {
            $(elem).wrap(`<a href='${$(elem).attr('src')}' data-fancybox='wysiwyg-gallery'></a>`);
        });
}