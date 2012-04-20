module Remoteable
  module AjaxRedirect
    class << self
      def included(base)
        base.class_eval do
          def redirect_to_with_xhr(*args)
            if request.xhr?
              response.headers["X-Remoteable-Redirect"] = url_for(*args)
              render :text => "", :status => 200
            else
              redirect_to_without_xhr(*args)
            end
          end

          alias_method_chain :redirect_to, :xhr
        end
      end
    end
  end
end
