# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "remoteable/version"

Gem::Specification.new do |s|
  s.name        = "remoteable"
  s.version     = Remoteable::VERSION
  s.authors     = ["Andrew Eberbach"]
  s.email       = ["andrew@ebertech.ca"]
  s.homepage    = ""
  s.summary     = %q{Remoteable AJAX content helper}

  s.rubyforge_project = "remoteable"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  # specify any dependencies here; for example:
  # s.add_development_dependency "rspec"
  # s.add_runtime_dependency "rest-client"
end
