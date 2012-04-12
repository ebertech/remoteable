require "remoteable/version"

module Remoteable
  autoload :AjaxRedirect, "remoteable/ajax_redirect"
end

require 'remoteable/engine' if defined?(Rails)