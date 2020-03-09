<?php

use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\CMS\Search\SearchForm;
use SilverStripe\ORM\FieldType\DBField;
class PageController extends ContentController
{
    /**
     * An array of actions that can be accessed via a request. Each array element should be an action name, and the
     * permissions or conditions required to allow the user to access it.
     *
     * <code>
     * [
     *     'action', // anyone can access this action
     *     'action' => true, // same as above
     *     'action' => 'ADMIN', // you must have ADMIN permissions to access this action
     *     'action' => '->checkAction' // you can only access this action if $this->checkAction() returns true
     * ];
     * </code>
     *
     * @var array
     */
    private static $allowed_actions = [
        'SearchForm',
        'results'
    ];

    protected function init()
    {
        parent::init();
        // You can include any CSS or JS required by your project here.
        // See: https://docs.silverstripe.org/en/developer_guides/templates/requirements/
    }

    public function SearchForm() 
   {
      return SearchForm::create($this, 'SearchForm');
   }
   
   public function results($data, $form, $request)
    {
        $data = array(
            'Results' => $form->getResults(),
            'Query' => DBField::create_field('Text', $form->getSearchQuery()),
            'Title' => _t('SilverStripe\\CMS\\Search\\SearchForm.SearchResults', 'Search Results')
        );
        return $this->owner->customise($data)->renderWith(array('Page_results', 'Page'));
    }
   
}
