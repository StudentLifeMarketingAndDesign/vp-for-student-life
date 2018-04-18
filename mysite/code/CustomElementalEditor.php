<?php
use SilverStripe\Core\ClassInfo;
use SilverStripe\Forms\FieldList;
use SilverStripe\SiteConfig\SiteConfig;
use DNADesign\Elemental\Models\ElementalArea;
use DNADesign\Elemental\Models\BaseElement;
use SilverStripe\ORM\DataExtension;
class CustomElementalEditor extends DataExtension {

public function updateField($gridField) {
	echo 'hello;';
	$gridField->rename('TEST');
}


}
