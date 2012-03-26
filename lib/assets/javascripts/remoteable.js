(function($) {

    $.extend(
        $.expr[":"], {
            remoteable: function(elem, i, match, array) {
                var url = match[3].split(",")[0];
                var method = match[3].split(",")[1] || "get";
                return $(elem).data("src") == url && $(elem).data("method") == method;
            }
        }
    );

    $.remoteables = function(url, method) {
        var remoteables = "*[data-src]";
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
    };

    var methods = {
        init: function(options) {
            options = options || {};
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('remoteable');
                // If the plugin hasn't been initialized yet
                if(!data) {
                    /*
                     Do more setup stuff here
                     */
                    $(this).data('remoteable', {
                        target: $this
                    });

                    var self = $(this);
                    var method = options["method"] || self.data("method") || "get";
                    self.attr("data-method", method);
                    var url = options["url"] || self.data("src");
                    self.attr("data-src", url);

                    self.on("click.remoteable", function(event) {
                        if(self.data("remote-delegate")) {
                            $(self.data('remote-delegate')).remoteable("update", {url: url});
                        } else {
                            if(self.is("a")) {
                                event.preventDefault();
                                if(self.data("remoteable").currentRequest) {
                                    self.data("remoteable").currentRequest.abort();
                                }
                                self.data("remoteable").currentRequest = httpMethods[method].call(self, {
                                    url: url,
                                    complete: function(jqXHR, textStatus) {
                                        self.data("remoteable").currentRequest = null;
                                    }
                                });
                                event.stopPropagation();
                            }
                        }
                    });

                    self.on("refresh.remoteable", function(event) {
                        var url = self.data("src");
                        event.preventDefault();
                        event.stopPropagation();

                        if(self.is(":not(a)")) {
                            if(self.data("remoteable").currentRequest) {
                                self.data("remoteable").currentRequest.abort();
                            }
                            self.data("remoteable").currentRequest = httpMethods[method].call(self, {
                                url: url,
                                complete: function(jqXHR, textStatus) {
                                    self.trigger("ajax:complete.remoteable", [jqXHR, textStatus]);
                                }
                            });
                        }
                    });

                    self.on("ajax:complete.remoteable", function(event, jqXHR, textStatus) {
                        event.stopPropagation();
                        event.preventDefault();
                        self.data("remoteable").currentRequest = null;
                        var ct = jqXHR.getResponseHeader("content-type") || "";
                        if(ct.indexOf('html') > -1) {
                            var returned = $(jqXHR.responseText);
							if(self.data("replace-self")) {
								self.replaceWith(returned);
							} else {
                            	self.html(returned);								
                            	self.trigger("refreshed.remoteable", [self.data("src")]);
							}
                        }
                        if(ct.indexOf('json') > -1) {
                            var url = $.parseJSON(jqXHR.responseText).redirect_to;
                            self.remoteable("update", {url: url});
                        }
                    });

                }
            });
        },

        destroy: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('remoteable');

                $this.removeData('remoteable');
            });
        },

        refreshAll: function(options) {
            $.remoteables().remoteable("refresh");
        },

        initAll: function(options) {
            $.remoteables().remoteable();
        },

        update: function(options) {
            return this.each(function() {
                var self = $(this);
                self.remoteable();
                if(options.url) {
                    self.data("src", options.url);
                }
                self.trigger("refresh.remoteable");
            });
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
            $.error('Method ' + method + ' does not exist on jQuery.remoteable');
        }

    };

})(jQuery);