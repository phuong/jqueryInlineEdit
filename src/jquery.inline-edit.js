/*!
 jQuery inlineEdit
 (c) 2015 Phuong Vu,
 updated: 2015-09-06
 license: http://www.opensource.org/licenses/mit-license.php
 */
(function ($) {

    var pluginName = "inlineEdit";

    //Default options
    var defaults = {
        //Function on update hidden field
        onUpdate: function () {
        },
        //Function on focus to ediable element
        onFocus: function () {
        },
        //Function call on key down on input field
        onKeyDown: function () {
        },
        //Css class when hover on editable item
        hoverClass: 'hover',
        //Show or hide counter in case set max length
        showCounter: true,
        //Input type, textarea or input type text
        inputType: 'textarea',
        //Maxth length of this input
        maxLength: false
    }

    function escapeSpaces(str) {
        return str.replace(/^ +/mg, function (match) {
            return match.replace(/ /g, "&nbsp;");
        });
    }

    function prepareOptions($element, options) {
        var elementOptions = {};
        if ($element.data('connect-with')) {
            elementOptions.connectWith = $element.data('connect-with');
        }
        if ($element.data('max-length')) {
            elementOptions.maxLength = $element.data('max-length');
        }
        if ($element.data('input-type')) {
            elementOptions.inputType = $element.data('input-type');
        }
        options = $.extend(options, elementOptions);
        return options;
    }

    function InlineEdit(element, opts) {
        var options = $.extend({}, defaults, opts);
        var $element = $(element);
        //Prepare in-tag options
        options = prepareOptions($element, options);
        //Hover
        $element.hover(function () {
            $element.addClass(options.hoverClass);
        }, function () {
            $element.removeClass(options.hoverClass);
        });
        $element.click(function () {
            var $this = $(this);
            var $connectWith = $("#" + $this.attr("data-connect-with"));
            var defaultText = $this.data('text');

            if (options.inputType == 'textarea') {
                var $replaceWith = $("<textarea></textarea>");
            } else {
                var $replaceWith = $("<input type=text />");
            }
            var $counter = $("<span class=counter></span>");
            if (options.showCounter == false) {
                $counter.hide();
            }
            var currentLength = 0;
            $replaceWith.val($connectWith.val().trim()).css({
                'width': $this.width(),
                'font-size': $this.css('font-size'),
                'font-family': $this.css('font-family'),
                'font-weight': $this.css('font-weight'),
                'line-height': $this.css('line-height'),
                'margin-top': $this.css('margin-top'),
                'text-transform': $this.css('text-transform'),
            });
            if(options.inpuType == 'textarea') {
                $replaceWith.autosize();
            }
            $this.hide();
            $this.after($counter.text($connectWith.val().length + "/" + options.maxLength));
            $this.after($replaceWith);
            $replaceWith.focus();

            var strLength = $replaceWith.val().length * 2;
            $replaceWith[0].setSelectionRange(strLength, strLength);

            //Call on focus method
            options.onFocus.call(element);

            $replaceWith.blur(function () {
                var val = $(this).val().trim().substring(0, options.maxLength);
                $connectWith.val(val).change();
                if (val !== '') {
                    $this.html(escapeSpaces(val.replace(/\n/g, "<br />")));
                } else {
                    $this.html(defaultText);
                }
                $(this).remove();
                $counter.remove();
                $this.show();
                options.onUpdate.call(element);
            }).keydown(function (e) {
                options.onKeyDown.call(element);
                if (options.maxLength > 0) {
                    var inp = String.fromCharCode(e.keyCode);
                    if (/[a-zA-Z0-9-_ ]/.test(inp) && $(this).val().length > options.maxLength - 1) {
                        return false;
                    }
                }
            }).keyup(function (e) {
                if (options.maxLength > 0) {
                    currentLength = $(this).val().length;
                    $counter.text(currentLength + "/" + options.maxLength);
                }
            });
        });
    }
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            $.data(this, 'plugin_' + pluginName, new InlineEdit(this, options));
        });
    }
})(jQuery);
