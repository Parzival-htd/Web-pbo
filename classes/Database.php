<?php
class Database {
    private const HOST = 'localhost', NAMA = 'ruang_kelas', USER = 'root', PASS = ''; // sesuaikan (XAMPP: root tanpa password)
    private static ?PDO $pdo = null;
    public static function koneksi(): PDO {
        if (self::$pdo === null) {
            self::$pdo = new PDO('mysql:host=' . self::HOST . ';dbname=' . self::NAMA . ';charset=utf8mb4', self::USER, self::PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }
        return self::$pdo;
    }
}
