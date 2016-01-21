/*!
 jQuery inlineEdit
 (c) 2015 Phuong Vu,
 updated: 2016-09-06
 license: http://www.opensource.org/licenses/mit-license.php
 */
// Next version, escape white space
(function($) {

    var pluginName = "inlineEdit";

    //Default options
    var defaults = {
        //Function on update hidden field
        onUpdate: function() {
        },
        //Function on focus to ediable element
        onFocus: function() {
        },
        //Function call on key down on input field
        onKeyDown: function() {
        },
        //Css class when hover on editable item
        hoverClass: 'hover',
        //Show or hide counter in case set max length
        showCounter: false,
        //Input type, textarea or input type text
        inputType: 'textarea',
        //Maxth length of this input
        maxLength: false,
        //Connect with an input
        connectWith: '#createOne',
        //Default text
        defaultText: false
    };

    var properties = [
        'font-size', 'font-family',
        'font-weight', 'line-height',
        'margin', 'padding', 'letter-spacing',
        'text-transform', 'display'
    ];

    function escapeSpaces(str) {
        return str.replace(/^ +/mg, function(match) {
            return match.replace(/ /g, "&nbsp;");
        });
    }

    function prepareOptions($element, options) {
        var elementOptions = {};
        //Todo, foreach for shorter code
        if ($element.data('connect-with')) {
            elementOptions.connectWith = $element.data('connect-with');
        }
        if ($element.attr('maxlength')) {
            elementOptions.maxLength = $element.attr('maxlength');
        }
        if ($element.data('input-type')) {
            elementOptions.inputType = $element.data('input-type');
        }
        if ($element.data('show-counter')) {
            elementOptions.connectWith = $element.data('show-counter');
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
        $element.hover(function() {
            $element.addClass(options.hoverClass);
        }, function() {
            $element.removeClass(options.hoverClass);
        });
        $element.click(function() {
            var $this = $(this);
            var $connectWith = $(options.connectWith);
            if (!$connectWith.length) {
                $connectWith = $('<input type="hidden" />').attr('id', options.connectWith.replace(/#/g, ''));
                $("body").append($connectWith);
            }
            var defaultText = $this.data('text');

            if (options.inputType == 'textarea') {
                var $replaceWith = $('<textarea></textarea>');
            } else {
                var $replaceWith = $('<input type=text />');
            }
            var $counter = $('<span class="counter"></span>');
            if (options.showCounter == false) {
                $counter.hide();
            }
            var currentLength = 0;
            var css = {
                'width': $this.width()
            };
            //Clone all css properties
            for (var i in properties) {
                css[properties[i]] = $this.css(properties[i]);
            }
            if(options.defaultText) {
                options.defaultText = false;
                $replaceWith.val($element.text().trim());
            } else {
                $replaceWith.val($connectWith.val().trim());
            }
            $replaceWith.css(css);
            //Check if autosize is loaded
            if (options.inputType == 'textarea' && $().autosize) {
                $replaceWith.autosize();
            }
            $this.hide();
            $this.after($counter.text($connectWith.val().length + "/" + options.maxLength));
            $this.after($replaceWith);
            $replaceWith.focus();
            var strLength = $replaceWith.val().length * 2;
            $replaceWith[0].setSelectionRange(strLength, strLength);
            //Call on focus method
            options.onFocus.call(element, $replaceWith.val());
            $replaceWith.blur(function(e) {
                var val = $(this).val().trim();
                if (options.maxLength) {
                    val = val.substring(0, options.maxLength);
                }
                $connectWith.val(val).change();
                if (val !== '') {
                    $this.html(escapeSpaces(val.replace(/\n/g, "<br />")));
                } else {
                    $this.html(defaultText);
                }
                $(this).remove();
                $counter.remove();
                $this.show();
                options.onUpdate.call(element, val);
            }).keydown(function(e) {
                options.onKeyDown.call(element, e);
                if (options.maxLength > 0) {
                    var inp = String.fromCharCode(e.keyCode);
                    if (/[a-zA-Z0-9-_ ]/.test(inp) && $(this).val().length > options.maxLength - 1) {
                        return false;
                    }
                }
            }).keyup(function(e) {
                if (options.maxLength > 0) {
                    currentLength = $(this).val().length;
                    $counter.text(currentLength + "/" + options.maxLength);
                }
            });
        });
    }
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            $.data(this, 'plugin_' + pluginName, new InlineEdit(this, options));
        });
    };
})(jQuery);
