<?php

namespace Core;

class Request
{
    /**
     * Lấy URI của request hiện tại.
     *
     * @return string
     */
    public static function uri()
{
    $uri = trim(
        parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH),
        '/'
    );

    // Xóa phần tên project và thư mục public
    $basePath = 'benhvientaman/public';

    if (strpos($uri, $basePath) === 0) {
        $uri = substr($uri, strlen($basePath));
    }

    return trim($uri, '/');
}

    /**
     * Lấy phương thức của request hiện tại (GET, POST, ...).
     *
     * @return string
     */
    public static function method()
    {
        return $_SERVER['REQUEST_METHOD']; // 'GET' hoặc 'POST'
    }
}
