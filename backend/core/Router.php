<?php

namespace Core;

class Router
{
    protected array $routes = [];

    /**
     * Khai báo Route GET
     */
    public function get(string $path, $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    /**
     * Khai báo Route POST
     */
    public function post(string $path, $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    /**
     * Thêm tuyến đường vào bảng ánh xạ
     */
    protected function addRoute(string $method, string $path, $handler): void
    {
        $path = '/' . trim($path, '/');
        if ($path !== '/') {
            $path = rtrim($path, '/');
        }
        $this->routes[strtoupper($method)][$path] = $handler;
    }

    /**
     * Điều phối và xử lý Request
     */
    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method);
        
        $uri = '/' . trim($uri, '/');
        if ($uri !== '/') {
            $uri = rtrim($uri, '/');
        }

        if (!isset($this->routes[$method][$uri])) {
            http_response_code(404);
            echo "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>404 Not Found</h1>";
            echo "<p style='font-family:sans-serif; text-align:center;'>Route <b>[{$method}] {$uri}</b> chưa được định nghĩa.</p>";
            exit();
        }

        $handler = $this->routes[$method][$uri];

        // 1. Xử lý Callback
        if (is_callable($handler)) {
            call_user_func($handler);
            return;
        }

        // 2. Xử lý dạng "Controller@method"
        if (is_string($handler)) {
            $parts = explode('@', $handler);
            $controllerName = $parts[0];
            $methodName = $parts[1] ?? 'index';

            // Tự động bổ sung namespace App\Controllers\ nếu chưa có
            if (!str_starts_with($controllerName, 'App\\Controllers\\')) {
                $controllerClass = 'App\\Controllers\\' . $controllerName;
            } else {
                $controllerClass = $controllerName;
            }

            if (class_exists($controllerClass)) {
                $controller = new $controllerClass();
                if (method_exists($controller, $methodName)) {
                    $controller->$methodName();
                    return;
                }
            }

            http_response_code(500);
            die("Lỗi Router: Không tìm thấy Controller [{$controllerClass}] hoặc phương thức [{$methodName}].");
        }
    }
}