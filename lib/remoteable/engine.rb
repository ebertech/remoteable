module Remoteable
  class Engine < Rails::Engine
    config.to_prepare do
      ActionController::Base.send(:helper, RemoteableHelper)
    end
  end
end
