<?php

use SilverStripe\Blog\Model\BlogPost;
use SilverStripe\Dev\BuildTask;

	class RemoveMemberRelationsTask extends BuildTask {


		protected $title = 'Remove all member/blog post relationships';
		protected $description = 'Disassociates members from posts and defaults to the "Additional Authors" field';

		protected $enabled = true;

		function run($request){
			$posts = BlogPost::get();
			echo '<p>Gathering all posts...</p>';
			echo '<ul>';
			foreach($posts as $post){
				echo '<li>Removing authors from <strong>'.$post->Title.'</strong></li>';
				$post->Authors()->removeAll();
			}
			echo '</ul>';
			echo 'Done.';

		}


	}