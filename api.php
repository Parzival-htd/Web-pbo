<?php
header('Content-Type: application/json; charset=utf-8');
spl_autoload_register(fn($c) => require __DIR__ . "/classes/$c.php");
try {
    $sis = new SistemRuang(Database::koneksi());
    $aksi = $_GET['aksi'] ?? 'data';
    $post = $_SERVER['REQUEST_METHOD'] === 'POST';
    if ($aksi === 'data') {
        echo json_encode($sis->semua());
    } elseif ($aksi === 'pinjam' && $post) {
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $p = new Peminjaman((int) ($d['ruangId'] ?? 0), (string) ($d['tanggal'] ?? ''), (string) ($d['mulai'] ?? ''),
                            (string) ($d['selesai'] ?? ''), trim((string) ($d['ket'] ?? '')), trim((string) ($d['peminjam'] ?? '')));
        echo json_encode($sis->ajukan($p));
    } elseif ($aksi === 'batal' && $post) {
        $sis->batal((int) ($_GET['id'] ?? 0));
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Aksi tidak dikenal']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Kesalahan server']);
}
