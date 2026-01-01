# Jawaban Soal Tugas Jobsheet/Modul 9

## 1. Perbedaan Fungsi socket.on di src/index.js dan public/js/chat.js

### Di src/index.js (Server-side):

```javascript
socket.on("join", (options, callback) => { ... })         // Mendengarkan event join dari client
socket.on("kirimPesan", (pesan, callback) => { ... })     // Mendengarkan event pengiriman pesan
socket.on("kirimLokasi", (coords, callback) => { ... })   // Mendengarkan event pengiriman lokasi
socket.on("disconnect", () => { ... })                    // Mendengarkan event disconnect
```

### Di public/js/chat.js (Client-side):

```javascript
socket.on("pesan", (message) => { ... })                  // Mendengarkan pesan yang diterima dari server
socket.on("locationMessage", (message) => { ... })        // Mendengarkan pesan lokasi dari server
socket.on("roomData", ({ room, users }) => { ... })       // Mendengarkan data ruang dan pengguna
```

### Perbedaan:

- **Server** mendengarkan event yang **dikirim client** (join, kirimPesan, kirimLokasi, disconnect)
- **Client** mendengarkan event yang **dikirim server** (pesan, locationMessage, roomData)
- Server memproses validasi, menyimpan data, kemudian broadcast ke semua client di ruang yang sama
- Client hanya menerima dan menampilkan data yang sudah diproses server

---

## 2. Console Browser Saat Proses Chat

Saat melakukan proses chat dan membuka console, akan ditampilkan:

```javascript
// Ketika menerima pesan (baris 42 di chat.js):
socket.on("pesan", (message) => {
  console.log(message);  // Output: Object {username: "nama", text: "pesan", createdAt: 1704096000000}
```

```javascript
// Ketika pesan berhasil dikirim (baris 81 di chat.js):
socket.emit("kirimPesan", pesan, (error) => {
  ...
  console.log("Pesan berhasil dikirim");  // Output: "Pesan berhasil dikirim"
});
```

```javascript
// Ketika lokasi berhasil dikirim (baris 96 di chat.js):
socket.emit("kirimLokasi", {...}, () => {
  console.log("Lokasi berhasil dikirim");  // Output: "Lokasi berhasil dikirim"
});
```

### Penjelasan alur:

- Baris 42: Server mengirim object pesan melalui emit "pesan" ke client
- Client menerima dan log object tersebut di console
- Baris 81-82: Setelah emit berhasil, callback dijalankan dan log success message

---

## 3. Fungsi Library (Mustache, Moment, Qs) di chat.html

### Library dimuat di chat.html (baris akhir):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.0.1/mustache.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qs/6.6.0/qs.min.js"></script>
```

### Fungsi di chat.js:

#### 1. **Qs** (Query String Parser) - Baris 15-17:

```javascript
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
```

Mengambil parameter `username` dan `room` dari URL query string yang dikirim dari index.html

#### 2. **Mustache** (Template Engine) - Baris 42-49:

```javascript
const html = Mustache.render(messageTemplate, {
  username: message.username,
  message: message.text,
  createdAt: moment(message.createdAt).format("H:mm"),
});
```

Merender template HTML dengan data pesan menggunakan syntax Mustache `{{variabel}}`

#### 3. **Moment** (Date Format Library) - Baris 48 & 60:

```javascript
createdAt: moment(message.createdAt).format("H:mm"),
```

Mengubah timestamp ke format jam:menit yang readable (contoh: "14:30")

---

## 4. Elements, Templates, dan Options di chat.js

### Elements (Baris 3-8):

```javascript
const $messageForm = document.querySelector("#form-pesan"); // Form input pesan
const $messageFormInput = document.querySelector("input"); // Input field
const $messageFormButton = document.querySelector("button"); // Tombol kirim pesan
const $sendLocationButton = document.querySelector("#kirim-lokasi"); // Tombol kirim lokasi
const $messages = document.querySelector("#messages"); // Container pesan
```

**Penjelasan:** Mengambil referensi elemen HTML dari chat.html untuk dimanipulasi dengan JavaScript

### Templates (Baris 10-13):

```javascript
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#locationMessage-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
```

**Penjelasan:** Mengambil template HTML (script tag) dari chat.html yang akan digunakan untuk rendering pesan dengan Mustache

### Options (Baris 15-18):

```javascript
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
```

**Penjelasan:** Mengekstrak username dan room dari URL yang dikirim dari index.html form submission

### Hubungan dengan HTML:

- Form di chat.html (form#form-pesan) diambil dan ditambahkan event listener
- Template dari chat.html (script#message-template) dirender untuk menampilkan pesan
- Username dan room dari index.html form ditransmisi via URL query string

---

## 5. Fungsi messages.js dan users.js

### src/utils/messages.js:

```javascript
const generateMessage = (username, text) => {
  return { username, text, createdAt: new Date().getTime() };
};

const generateLocationMessage = (username, url) => {
  return { username, url, createdAt: new Date().getTime() };
};
```

**Fungsi:** Membuat object pesan dengan struktur yang konsisten dan timestamp

#### Koneksi dengan file lain:

- **src/index.js** (baris 38, 50, 81, 86): Menggunakan `generateMessage()` dan `generateLocationMessage()` untuk emit ke client
- **public/js/chat.js** (baris 42, 52): Menerima object pesan dan merender dengan Mustache
- **chat.html**: Menampilkan data pesan melalui template

### src/utils/users.js:

```javascript
const tambahPengguna = ({ id, username, room }) => { ... }  // Validasi dan tambah user
const hapusPengguna = (id) => { ... }                        // Hapus user saat disconnect
const ambilPengguna = (id) => { ... }                        // Ambil data user by id
const ambilPenggunaDariRoom = (room) => { ... }              // Ambil semua user di room
```

#### Koneksi dengan file lain:

- **src/index.js** (baris 26, 74, 56, 44): Mengelola user state dan emit roomData
- **public/js/chat.js** (baris 65): Menerima roomData dan merender sidebar dengan Mustache
- **chat.html**: Menampilkan daftar user di sidebar melalui template

---

## 6. Cara Aplikasi Mengirimkan Lokasi

### Proses di public/js/chat.js (Baris 88-99):

```javascript
$sendLocationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Browser anda tidak mendukung Geolocation");
  }

  $sendLocationButton.setAttribute("disabled", "disabled"); // Disable tombol

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "kirimLokasi",
      {
        // Emit ke server
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled"); // Enable tombol
        console.log("Lokasi berhasil dikirim");
      }
    );
  });
});
```

### Proses di src/index.js (Baris 63-70):

```javascript
socket.on("kirimLokasi", (coords, callback) => {
  const user = ambilPengguna(socket.id);

  io.to(user.room).emit(
    "locationMessage",
    generateLocationMessage(
      user.username,
      `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
    )
  );

  callback();
});
```

### Alur:

1. Client klik tombol "Share Lokasi"
2. Browser request GPS location via Geolocation API
3. Client emit "kirimLokasi" dengan latitude/longitude
4. Server terima, generate URL Google Maps, broadcast ke semua user di room
5. Client terima "locationMessage" dan tampilkan link

---

## 7. Perbedaan npm run dev vs npm run start

### Di package.json:

```json
"scripts": {
  "start": "node src/index.js",    // Jalankan langsung tanpa monitoring
  "dev": "nodemon src/index.js",   // Jalankan dengan auto-restart saat file berubah
}
```

### Perbedaan:

- **`npm run start`**: Menjalankan aplikasi sekali. Jika ada perubahan kode, harus restart manual.
- **`npm run dev`**: Menjalankan dengan nodemon (ada di devDependencies). Nodemon otomatis restart server jika ada perubahan file, sangat berguna untuk development.

### Mengapa gunakan npm run dev?

- Nodemon menghemat waktu development dengan auto-restart
- Tidak perlu stop dan start manual setiap kali ada perubahan kode

---

## 8. Fungsi Socket Selain socket.on

### socket.emit() - Mengirim event:

```javascript
socket.emit("pesan", generateMessage(...))              // Baris 38: Emit ke client yang terhubung
socket.broadcast.to(user.room).emit(...)                // Baris 40: Emit ke semua di room kecuali pengirim
io.to(user.room).emit("roomData", ...)                  // Baris 44: Emit ke semua di room
```

### socket.join() - Bergabung ke room:

```javascript
socket.join(user.room); // Baris 36: Menambahkan socket ke room tertentu
```

### socket.on() - Mendengarkan event:

(sudah dijelaskan di soal 1)

### socket.broadcast - Mengirim ke semua kecuali pengirim:

```javascript
socket.broadcast.to(user.room).emit(...)  // Baris 40: Mengirim ke semua di room kecuali pengirim
```

### Ringkasan socket methods:

- **`socket.emit()`**: Kirim ke client tertentu
- **`socket.on()`**: Terima event dari client
- **`socket.join()`**: Masuk ke room
- **`socket.broadcast`**: Kirim ke semua kecuali pengirim
- **`io.to()`**: Kirim ke semua di room tertentu

---

## 9. Real-Time Bidirectional Event-Based Communication

Konsep ini berarti:

- **Real-time**: Komunikasi terjadi instan tanpa delay
- **Bidirectional**: Data bisa mengalir dari client ke server dan sebaliknya
- **Event-based**: Menggunakan event listener dan emitter

### Demonstrasi di aplikasi:

```javascript
// CLIENT MENGIRIM KE SERVER (client → server)
socket.emit("kirimPesan", pesan, (error) => { ... })     // Chat.js baris 79

// SERVER MENDENGARKAN
socket.on("kirimPesan", (pesan, callback) => { ... })    // Index.js baris 49

// SERVER MENGIRIM KE CLIENT (server → client)
io.to(user.room).emit("pesan", generateMessage(...))     // Index.js baris 44

// CLIENT MENDENGARKAN
socket.on("pesan", (message) => { ... })                 // Chat.js baris 42
```

### Alur bidirectional:

1. User A di client A ketik pesan → `socket.emit("kirimPesan")`
2. Server mendengarkan → `socket.on("kirimPesan")`
3. Server broadcast ke semua client di room → `io.to(room).emit("pesan")`
4. Semua client mendengarkan → `socket.on("pesan")` dan render UI
5. User B di client B melihat pesan User A dalam real-time

### Teknologi yang memungkinkan:

**Socket.io** memungkinkan komunikasi real-time bidirectional dengan WebSocket yang membuat persistent connection antara client dan server, jadi data bisa dikirim kapan saja tanpa polling.

---
