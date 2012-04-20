//= require jquery.url

(function($) {

    $.extend(
        $.expr[":"], {
            remoteable: function(elem, i, match, array) {
                var url = match[3].split(",")[0];
                var method = match[3].split(",")[1] || "get";
                var matcher = new RegExp("^" + url + "([.\\/]|$)");
                return matcher.test($(elem).data("src")) && $(elem).data("method") == method;
            }
        }
    );

    var remoteable;

    var normalizeRemoteables = function(elements, options) {
        options = normalizeOptions(options);
        elements.each(function() {
            var self = $(this);
            var data = self.data("remoteable");
            if(!data) {
                data = self.data("remoteable", {currentRequest: null});
            }
            var url = normalizeUrl(options.url || self.data("src"));
            var method = options.method || self.data("method") || "get";
            self.attr("data-method", method);
            self.attr("data-src", url);
            self.data("src", url)
            self.data("method", method);
        });
    }

    var normalizeUrl = function(url) {
        var baseUrl = $.url(window.location).attr("base");
        var parsedUrl = $.url(url);
        if(parsedUrl.host) {
            return url;
        }
        return baseUrl + parsedUrl.attr("relative");
    };

    var normalizeOptions = function(options) {
        options = options || {};
        options.selector = options.selector || remoteable.defaultSelector;

        return options;
    };

    var performRequest = function() {
        var self = $(this);

        normalizeRemoteables(self);
        var url = self.data("src");
        var method = self.data("method");
        self.addClass("remoteable-processing");

        if(self.data("remoteable").currentRequest) {
            self.data("remoteable").currentRequest.abort();
        }
        self.data("remoteable").currentRequest = remoteable.httpMethods[method].call(self, {
            url: url,
            complete: function(jqXHR, textStatus) {
                self.removeClass("remoteable-processing");
                jqXHR.ajaxSettings = this;
                self.trigger("complete.remoteable", [jqXHR, textStatus]);
                if(self.data("remoteable")) {
                    self.data("remoteable").currentRequest = null;
                }
            }
        });
    };

    $.remoteable = remoteable = {
        linkSelector: 'a',
        defaultSelector: "*[data-src]",
        httpMethods: {
            put: function(options) {
                if(options.data == undefined) {
                    options.data = {};
                }
                options.data._method = 'PUT';
                options.type = "POST";
                return $.ajax(options);
            },
            delete: function(options) {
                if(options.data == undefined) {
                    options.data = {};
                }
                options.data._method = 'DELETE';
                options.type = "POST";
                return $.ajax(options);
            },
            post: function(options) {
                options.type = "POST";
                return $.ajax(options);
            },
            get: function(options) {
                options.type = "GET";
                return $.ajax(options);
            }
        },
        clickHandler: function(event) {
            var self = $(event.currentTarget);
            normalizeRemoteables(self);

            if(self.data("remote-delegate")) {
                $(self.data('remote-delegate')).remoteable("update", {
                    url: self.data("src")
                });
                event.preventDefault();
                event.stopPropagation();
            } else {
                if($(event.currentTarget).is("a")) {
                    performRequest.call(self);
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        },
        refreshHandler: function(event) {
            var self = $(event.currentTarget);
            normalizeRemoteables(self);
            if(!self.is("a")) {
                event.preventDefault();
                event.stopPropagation();

                performRequest.call(self);
            }
        },
        completeHandler: function(event, jqXHR, textStatus) {
            if(event.target == event.currentTarget) {
                var self = $(event.target);
                normalizeRemoteables(self);
                self.data("remoteable").currentRequest = null;
                var redirect = jqXHR.getResponseHeader("X-Remoteable-Redirect")
                if(redirect) {
                    normalizeRemoteables(self, {url: redirect});
                    self.trigger("refresh");
                    return false;
                } else {
                    var ct = jqXHR.getResponseHeader("content-type") || "";
                    if(ct.indexOf('html') > -1) {
                        var returned = $(jqXHR.responseText);
                        if(self.data("replace-self")) {
                            self.replaceWith(returned);
                            normalizeRemoteables(returned);
                        } else {
                            self.html(returned);
                        }
                    }
                }
            }
        }

    }

    $.remoteables = function(url, method) {
        var remoteables = remoteable.defaultSelector;
        var params = []

        if(url) {
            params.push(url);
        }
        if(method) {
            params.push(method);
        }
        if(params.length > 0) {
            remoteables += ":remoteable(" + params.join(",") + ")";
        }

        return $(remoteables);
    }

    var methods = {
        init: function(options) {
            options = normalizeOptions(options);

            return this.each(function() {
                var self = $(this),
                    data = self.data('remoteable');
                // If the plugin hasn't been initialized yet
                if(!data) {
                    self.data('remoteable', {
                        target: self,
                        options: options
                    });

                    self.on("click.remoteable", options.selector, remoteable.clickHandler);
                    self.on("refresh.remoteable", options.selector, remoteable.refreshHandler);
                    self.on("ajax:complete.remoteable complete.remoteable", options.selector, remoteable.completeHandler);
                }

                normalizeRemoteables($(options.selector), options);
            });
        },

        destroy: function(options) {
            options = normalizeOptions(options);

            return this.each(function() {
                var self = $(this),
                    data = $this.data('remoteable');
                self.removeData('remoteable');

                normalizeRemoteables(self.find(options.selector), options);
                self.find(options.selector).trigger("destroyed.remoteable");
            });
        },

        update: function(options) {
            normalizeRemoteables(this, options);
            this.trigger("refresh.remoteable");
        },

        refresh: function(options) {
            normalizeRemoteables(this, options);
            $(this).trigger("refresh.remoteable");
        }
    };

    $.fn.remoteable = function(method) {

        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.remoteable');
        }

    };

    $(document).ready(function() {
        $('body').remoteable();
    });

})
    (jQuery);