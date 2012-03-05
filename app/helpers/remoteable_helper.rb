module RemoteableHelper
  def remote_content_tag(tag, options = {}, &block)
    normalize_remoteable_params!(options)

    content_tag(tag, options) do
      yield if options['data-loaded']
    end
  end

  def link_to_refresh(link, target, options = {})
    normalize_remoteable_params!(options)

    link_to link, target, options
  end

  def link_to_remoteable(link, options = {})
    normalize_remoteable_params!(options)

    link_to_function link, "return false;", options
  end

  def refresh_remoteable(options)
    normalize_remoteable_params!(options)

    %Q{$.remoteables("#{j options["data-src"]}").remoteable("refresh")}
  end

  private

  def polymorphic_link_from_options(url, options = {})
    return url if url.is_a?(String)
    args = [url]
    args << {:format => options[:format]} if options[:format]
    polymorphic_url(*args)
  end

  def normalize_remoteable_params!(options)
    data_method = options[:method] || "get"
    
    if(options[:url])
      url = polymorphic_link_from_options(options[:url], options)
      options['data-src'] = url
      options['data-method'] = data_method
    end

    options['data-loaded'] = !!options[:loaded]
    Rails.logger.info("Data loaded: #{options['data-loaded']}")
    options[:class] = options[:loaded_class] if options[:loaded] && options[:loaded_class]

    options[:style] = "display: none;" if options[:hide_until_loaded] && !options['data-loaded']

    options.delete(:method)
    options.delete(:url)
    options.delete(:format)
    options.delete(:loaded)
    options.delete(:hide_until_loaded)
    options.delete(:loaded_class)    
  end


end