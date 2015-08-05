function highlight()
{
	var page_id = (document.querySelector("input[name='parent']") || {}).value;

	// Not recognizing this page as a post; exiting.
	if (!page_id)
		return;

	chrome.storage.sync.get
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

			// If this is the first visit to the thread, don't mark everything.
			if (Object.keys(old_posts).length > 0)
			{
				var new_posts = posts.filter(function(post) { return !(post.id in old_posts); });
				new_posts.forEach(function(post) { post.element.style.background = "blue"; });
			}

			// The data stored in chrome.storage.sync is a hash of the post IDs seen
			// on this page.
			var update = {};
			update[page_id] = posts.reduce
			(
				function(accumulator, post)
				{
					accumulator[post.id] = true;
					return accumulator;
				},
				{}
			);

			chrome.storage.sync.set(update);
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
