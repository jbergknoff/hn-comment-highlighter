function thing()
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
			console.log("old posts: ", old_posts);

			var posts = document.querySelectorAll("span.comhead > a[href^='item?']") || [];
			if (Object.keys(old_posts).length > 0)
			{
				[].forEach.call
				(
					posts,
					function(element)
					{
						var href = element.href || "";
						var post_id = href.slice(href.lastIndexOf("id=") + 3);
						if (post_id in old_posts)
							return;

						// TODO: too brittle
						element.parentNode.parentNode.parentNode.style.background = "blue";
					}
				);
			}

			var post_ids = [].map.call
			(
				posts,
				function(element)
				{
					var href = element.href || "";
					return href.slice(href.lastIndexOf("id=") + 3);
				}
			);

			var update = {};
			update[page_id] = post_ids.reduce
			(
				function(accumulator, post_id)
				{
					accumulator[post_id] = true;
					return accumulator;
				},
				{}
			);

			chrome.storage.sync.set(update, function() {});
		}
	);
}

thing();
