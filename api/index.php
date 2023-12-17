<?php
header('Content-Type: application/json');

// Lokasi folder untuk menyimpan file
$folderPath = 'file/';

// Mendapatkan informasi file yang diupload
$fileName = $_FILES['file']['name'];
$filePath = $folderPath . $fileName;

// Mengambil ekstensi file
$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

// Ekstensi yang diizinkan
$allowedExtensions = array('html', 'css', 'txt', 'mp3', 'jpg', 'mp4', 'js');

// Memeriksa apakah file sudah ada atau memiliki ekstensi yang diizinkan
if ($fileName === 'index.html' || !in_array($fileExtension, $allowedExtensions)) {
    $response = array('success' => false, 'author' => 'XenzOfficial', 'message' => 'File tidak diizinkan atau sudah ada');
    echo json_encode($response);
} else {
    // Memindahkan file ke folder tujuan
    move_uploaded_file($_FILES['file']['tmp_name'], $filePath);

    $response = array('success' => true, 'author' => 'XenzOfficial', 'message' => 'File berhasil diupload', 'path' => $filePath);
    echo json_encode($response);
}
?>
