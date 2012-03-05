(function($) {

    $.remoteables = function(url, method) {
        var remoteables = "*:not(a)[data-src]";
        if(url) {
            remoteables += "[data-src^='" + url + "']";
        }
        if(method) {
            remoteables += "[data-method='" + method + "']";
        }

        return $(remoteables);
    }

    var httpMethods = {
        put: function(options) {
            if(options.data == undefined) {
                options.data = {};
            }
            options.data._method = 'PUT';
            options.type = "POST";
            $.ajax(options);
        },
        delete: function(options) {
            if(options.data == undefined) {
                options.data = {};
            }
            options.data._method = 'DELETE';
            options.type = "POST";
            $.ajax(options);
        },
        post: function(options) {
            options.type = "POST";
            $.ajax(options);
        },
        get: function(options) {
            options.type = "GET";
            $.ajax(options);
        }
    };

    var methods = {
        init: function(options) {
            if(options == undefined) {
                options = {};
            }
            return this.each(function() {
                var self = $(this);
                var method = options["method"] || self.data("method") || "get";
                self.attr("data-method", method);
                var url = options["url"] || self.data("src");
                self.attr("data-src", url);

                self.unbind("refresh.remoteable");
                self.bind("refresh.remoteable", function(event) {
                    event.preventDefault();
                    event.stopPropagation();

                    httpMethods[method].call(null, {
                        url: url,
                        complete: function(data, textStatus, jqXHR) {
                            var returned = $(data.responseText);
                            self.replaceWith(returned);
                            returned.trigger("refreshed.remoteable");
                        }});
                });

                if(!self.data("loaded")) {
                    self.remoteable("refresh");
                }
            });
        },

        refreshAll: function(options) {
            $.remoteables().remoteable("refresh");
        },

        initAll: function(options) {
            $.remoteables().remoteable();
        },

        refresh: function(options) {
            return this.each(function() {
                var self = $(this);
                self.trigger("refresh.remoteable");
            });
        }
    };

    $.fn.remoteable = function(method) {
        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };


// 
// $.fn.remoteableLink = function () {
// 	return $(this).each(function () {
// 		var link = $(this);
// 		link.unbind("click.remoteFetch");
// 		link.bind("click.remoteFetch", function (event) {
// 			$("*[data-src='" + link.attr("href") + "']").trigger("refresh.remoteable");
// 		});
// 	});
// };
})(jQuery);


(function($) {

    $.remoteableLinks = function(url, method) {
        var remoteables = "a[data-src]";
        if(url) {
            remoteables += "[data-src|='" + url + "']";
        }
        if(method) {
            remoteables += "[data-method='" + method + "']";
        }

        return $(remoteables);
    }

    var httpMethods = {
        put: function(options) {
            if(options.data == undefined) {
                options.data = {};
            }
            options.data._method = 'PUT';
            options.type = "POST";
            $.ajax(options);
        },
        delete: function(options) {
            if(options.data == undefined) {
                options.data = {};
            }
            options.data._method = 'DELETE';
            options.type = "POST";
            $.ajax(options);
        },
        post: function(options) {
            options.type = "POST";
            $.ajax(options);
        },
        get: function(options) {
            options.type = "GET";
            $.ajax(options);
        }
    };

    var methods = {
        init: function(options) {
            if(options == undefined) {
                options = {};
            }
            return this.each(function() {
                var self = $(this);
                var method = options["method"] || self.data("method") || "get";
                self.attr("data-method", method);
                var url = options["url"] || self.data("src");
                self.attr("data-src", url);

                self.unbind("click.remoteable");
                self.bind("click.remoteable", function(event) {
                    event.preventDefault();
                    event.stopPropagation();

                    httpMethods[method].call(null, {
                        url: url
                    });
                });
            });
        },

        refreshAll: function(options) {
            $.remoteableLinks().remoteableLink("refresh");
        },

        initAll: function(options) {
            $.remoteableLinks().remoteableLink();
        },

        refresh: function(options) {
            return this.each(function() {
                var self = $(this);
                self.trigger("click.remoteable");
            });
        }
    };

    $.fn.remoteableLink = function(method) {
        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    }
})(jQuery);


