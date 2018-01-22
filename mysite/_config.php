<?php

use SilverStripe\ORM\Connect\MySQLDatabase;
use SilverStripe\i18n\i18n;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Control\Director;
use SilverStripe\Security\Authenticator;

use SilverStripe\Core\EnvironmentLoader;
// $env = BASE_PATH . '/mysite/.env';
// $loader = new EnvironmentLoader();
// $loader->loadFile($env);


//MySQLDatabase::set_connection_charset('utf8');

// Set the site locale
i18n::set_locale('en_US');
// Enable nested URLs for this site (e.g. page/sub-page/)
//if (class_exists(SiteTree::class)) SiteTree::enable_nested_urls();

if (Director::isLive()) Director::forceSSL();
// Authenticator::set_default_authenticator('SAMLAuthenticator');
