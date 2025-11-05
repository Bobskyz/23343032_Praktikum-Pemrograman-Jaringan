const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb://admin:admin123@127.0.0.1:27017/mydatabase?authSource=admin';
const client = new MongoClient(url);
const namaDatabase = 'testsaja';

async function main() {
    try {
        await client.connect();
        console.log('Berhasil terhubung ke MongoDB database server');
        const db = client.db(namaDatabase);

        
       /* db.collection('pengguna').deleteMany({
            usia: 25
        }).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.error(error);
        })
        */

        db.collection('tugas').deleteOne({
            Deskripsi: 'Memberikan bimbingan'
        }).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.error(error);
        })
    } catch (error) {
        console.error(error);
    }
}
main();