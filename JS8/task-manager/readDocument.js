const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb://admin:admin123@127.0.0.1:27017/mydatabase?authSource=admin';
const client = new MongoClient(url);
const namaDatabase = 'testsaja';

async function main() {
    try {
        await client.connect();
        console.log('Berhasil terhubung ke MongoDB database server');
        const db = client.db(namaDatabase);

        // Mencari satu dokumen dalam koleksi 'pengguna' berdasarkan nama 'Dafin'.
        const byNama = await db.collection('pengguna').findOne({ nama: 'Dafin' });
        
        // Mencari satu dokumen dalam koleksi 'pengguna' berdasarkan ID objek tertentu.
        const byObjectID = await db.collection('pengguna').findOne({ _id: new ObjectId("690b39107709830e9156b7e8") });
        
        // Mencari beberapa dokumen dalam koleksi 'pengguna' dengan kriteria usia 20 dan mengubahnya menjadi array.
        const toArray = await db.collection('pengguna').find({ usia: 20 }).toArray();
        
        // Menggunakan if statement dengan kondisi yang salah. (Ini tidak akan berfungsi sebagaimana yang diharapkan)
        if (byNama && byObjectID && toArray) {
            // Menampilkan hasil pencarian berdasarkan nama, ID objek, dan kriteria usia.
            console.log('Data Pengguna ditemukan (berdasarkan nama):', byNama);
            console.log('Data Pengguna ditemukan (berdasarkan ID Objek):', byObjectID);
            console.log('Data Pengguna ditemukan (dalam format Array):', toArray);
        } else {
            // Menampilkan pesan bahwa data pengguna tidak ditemukan.
            console.log('Data Pengguna tidak ditemukan');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
// Memanggil fungsi 'main' dan menangani kesalahan (jika ada) dengan mencetak pesan kesalahan ke konsol.
main().catch(console.error);
