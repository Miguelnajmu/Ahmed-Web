<?php
// ====== Koneksi ke Database ======
$host = "localhost";   // Server MySQL
$user = "root";        // Username default XAMPP
$pass = "";            // Password default XAMPP kosong
$db   = "portfolio";   // Nama database

$conn = new mysqli($host, $user, $pass, $db);

// Cek koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// ====== Pastikan request method POST ======
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Ambil data dari form
    $nama  = $_POST['nama'] ?? '';
    $email = $_POST['email'] ?? '';
    $pesan = $_POST['pesan'] ?? '';

    // Validasi sederhana biar ga kosong
    if (empty($nama) || empty($email) || empty($pesan)) {
        echo "Semua field harus diisi!";
        exit;
    }

    // ====== Siapkan & jalankan query ======
    $stmt = $conn->prepare("INSERT INTO pesan (nama, email, pesan) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nama, $email, $pesan);

    if ($stmt->execute()) {
        echo "Pesan berhasil disimpan!";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}

// Tutup koneksi
$conn->close();
?>
