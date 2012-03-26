# Remoteable

Remoteable is meant to be a simple set of conventions about how data is loaded into
a browser. The main idea goes back to the idea of how a browser loads built-in elements that aren't 
inline text. Specifically, the whole idea of remoteable came from the realization that we've been using the
"Asynchronous" from "AJAX" since the first day we wrote an `<img>` tag. For example:

	<img src="http://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png">
	
What does the browser do when it sees this in the HTML? It goes off, starts downloading the picture and
then renders the picture and inserts it where the `<img>` tag lives in the rendered document. What
we've been doing by manually managing AJAX requests that go out, get some content, and inject it into the
resulting document is akin to manually downloading the images and injecting the result into the DOM. This
took me a bit to really grasp. Here's the core remoteable idea:

	<div id="mydiv" data-src="http://somewhere.com/users/3">
	
In this instance treat the rendered user div on the page as a single resource that you go out and download and
then inject into the DOM as a replacement for the `<div>` placeholder. 
	
Triggering it to load itself can be done a number of ways. You can target the div yourself:

	$("#mydiv").trigger("refresh")
	
You can do a search for divs that have a common URL

	$("*:remoteable(http://somewhere.com/users/3)").trigger("refresh")
	
You can refresh all the remoteables:
	
	$.remoteables.trigger("refresh")
	
And so on. 
		
## Delegates

There are many times where one part of the page needs to be updated with some content. Given that a remoteable
div has a data-src it's very easy to tell the div to refresh itself, but a common pattern is changing the 
div's `data-src` attribute and asking it to refresh. Handling this pattern is as simple as:

	<div data-remote-delegate="#some_selector" data-src="http://somewhere.com/users/3">
	
When a click event hits this element (either directly or through event bubbling), remoteable will wrap the `data-remote-delegate`
value in a jQuery selector and call `remoteable("update")` with its own `data-src` url and asks it to refresh. This is roughly
equivalent to:
	
	$("#some_selector").remoteable("update", {url: "http://somewhere.com/users/3"}).trigger("refresh.remoteable");
	
This way, the target element(s) become remoteable (if they weren't already), and the rest of the remoteable flow happens
as normal. Note, the original event continues to bubble but preventDefault is called on it. 

If the target element is already loading a request that request will be cancelled first. 

## Content on the way back

When the remoteable request completes the target element will check the response type. If it's HTML it will replace its content
with what was returned by the AJAX request. If you'd rather that the returned content *replace* the remoteable, just add
`data-replace-self=true` to the element:

	<div data-src="http://somewhere.com/users/3" data-replace-self="true">
	
This is useful for divs that show loading status and should be removed once loading is complete. This way you don't have to worry
about cleaning up the loading div as it is handled automatically.

## Redirects

TODO: writeup