<?php

/** @var Core\Router $router */

// Public routes
$router->get('/', 'HomeController@index');
$router->get('/login', 'AuthController@showLoginForm');
$router->post('/login', 'AuthController@login');
$router->get('/register', 'AuthController@showRegisterForm');
$router->post('/register', 'AuthController@register');
$router->get('/logout', 'AuthController@logout');

// Public Doctor & Services routes
$router->get('/doctors', 'DoctorController@index');
$router->get('/doctor', 'DoctorController@index');
$router->get('/api/doctors', 'DoctorController@apiIndex');
$router->get('/services', 'ServiceController@index');
$router->get('/service', 'ServiceController@index');
$router->get('/api/services', 'ServiceController@apiIndex');
$router->get('/contact', 'HomeController@contact');
// Admin routes
$router->get('/admin', 'Admin\AdminController@dashboard');
$router->get('/admin/dashboard', 'Admin\AdminController@dashboard');
$router->get('/admin/doctors', 'Admin\DoctorController@index');
$router->get('/admin/doctors/create', 'Admin\DoctorController@create');
$router->post('/admin/doctors/store', 'Admin\DoctorController@store');
$router->get('/admin/appointments', 'Admin\AppointmentController@index');
$router->get('/admin/patients', 'Admin\PatientController@index');
$router->get('/admin/schedules', 'Admin\ScheduleController@index');
$router->get('/admin/services', 'Admin\ServiceController@index');
$router->get('/admin/specialties', 'Admin\SpecialtyController@index');
$router->get('/admin/medicines', 'Admin\MedicineController@index');
// Admin Medicine Routes
$router->get('/admin/medicines', 'Admin\MedicineController@index');
$router->get('/admin/medicines/create', 'Admin\MedicineController@create');
$router->post('/admin/medicines/store', 'Admin\MedicineController@store');
// Doctor authenticated routes
$router->get('/doctor/dashboard', 'DoctorController@dashboard');
$router->get('/doctor/appointments', 'DoctorController@appointments');
$router->get('/doctor/schedules', 'DoctorController@schedules');
$router->get('/doctor/schedule', 'DoctorController@schedules');
$router->post('/doctor/schedules/save', 'DoctorController@saveSchedule');
$router->post('/doctor/schedule/save', 'DoctorController@saveSchedule');
$router->get('/doctor/patients', 'DoctorController@patients');
$router->get('/doctor/profile', 'DoctorController@showProfile');
$router->post('/doctor/profile/update', 'DoctorController@updateProfile');

// Patient routes
$router->get('/patient/appointments', 'PatientController@appointments');
$router->get('/patient/history', 'PatientController@history');
$router->get('/patient/profile', 'PatientController@profile');
$router->post('/patient/profile/update', 'PatientController@updateProfile');
// Admin Patients Routes
$router->get('/admin/patients', 'Admin\PatientController@index');
$router->get('/admin/patients/show', 'Admin\PatientController@show');
$router->get('/admin/patients/detail', 'Admin\PatientController@show');
// Appointment routes
$router->get('/appointments/create', 'AppointmentController@create');
$router->post('/appointments/store', 'AppointmentController@store');