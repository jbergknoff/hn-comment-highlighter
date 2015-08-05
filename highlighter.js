function highlight()
{
	var page_id = (document.querySelector("input[name='parent']") || {}).value;

	// Not recognizing this page as a post; exiting.
	if (!page_id)
		return;

	chrome.storage.local.get
	(
		page_id,
		function(result)
		{
			var old_posts = (result || {})[page_id] || {};

			// `posts` will be an array of { "id": ..., "element": ... }
			// where `element` is a reference to the `td` element that needs to be styled.
			var posts = [].map.call(document.querySelectorAll("td.default"), extract_post_details);
			// Throw out posts that we couldn't identify.
			posts = posts.filter(function(post) { return post.id; });

			// Only mark posts if the page has been visited before (i.e. some entries in `old_posts`)
			if (Object.keys(old_posts).length > 0)
			{
				posts.forEach
				(
					function(post)
					{
						var element_class = (post.id in old_posts) ? "hn-old-post" : "hn-new-post";
						post.element.className += " " + element_class;
					}
				);
			}

			// The data stored is a hash of the post IDs seen on this page.
			var update = {};
			update[page_id] = posts.reduce
			(
				function(accumulator, post)
				{
					accumulator[post.id] = 1;
					return accumulator;
				},
				{}
			);

			chrome.storage.local.set(update);
		}
	);

	function extract_post_details(element)
	{
		// The only identifier in the DOM (at the time of this writing) is a permanent
		// link to the post. Here, parse that link's href, assuming it's in the form
		// "item?id=...".
		var identifying_tag = element.querySelector(":scope a[href^='item?']");
		if (!identifying_tag)
			return {};

		var href = identifying_tag.href || "";
		var post_id = href.slice(href.lastIndexOf("id=") + 3);
		return { "id": post_id, "element": element };
	}
}

highlight();
