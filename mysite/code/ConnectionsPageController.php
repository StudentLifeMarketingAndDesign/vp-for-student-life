<?php
use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\ORM\PaginatedList;


class ConnectionsPageController extends PageController {

	public function init() {
		parent::init();

	}

	public function PaginatedList() {
		$entries = $this->RSSDisplay(0, 'http://us2.campaign-archive2.com/feed?u=c61b1cddac92babd42d7d628e&id=5026ed5926');
		$paginatedList = new PaginatedList($entries, $this->request);
		$paginatedList->setPageLength(10);
		return $paginatedList;
	}

}