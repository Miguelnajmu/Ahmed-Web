<?php
include 'functions.php';

// Tambah user
tambahUser("Budi", "budi@example.com");

// Ambil semua user
$data = ambilUsers();
foreach ($data as $row) {
    echo $row['name'] . " - " . $row['email'] . "<br>";
}

// Update user id=1
updateUser(1, "Budi Update", "budi_new@example.com");

// Hapus user id=2
hapusUser(2);
?>
