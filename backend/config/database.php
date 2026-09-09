<?php

$driver = getenv('DB_CONNECTION') ?: getenv('DB_DRIVER') ?: 'mysql';

return [
    'driver' => $driver,
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => getenv('DB_PORT') ?: 3307,
    'name' => getenv('DB_NAME') ?: 'benhvientaman',
    'user' => getenv('DB_USER') ?: 'root',
    'pass' => getenv('DB_PASSWORD') ?: '',
    'charset' => getenv('DB_CHARSET') ?: 'utf8mb4'
];