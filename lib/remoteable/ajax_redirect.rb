module Remoteable
  module AjaxRedirect
    class << self
      def included(base)
        base.class_eval do
          def redirect_to_with_xhr(*args)
            if request.xhr?
              @redirect_to = url_for(*args)
              respond_to do |format|
                format.json do
                  render :text => %Q{{
                  	"redirect_to": "#{ @redirect_to }"
                  }}, :format => :js
                end
              end

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
