<?php

// In app/Http/Middleware/HandleCors.php or in config/cors.php
return [
    'paths' => ['api/*', 'fetch-locations'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
