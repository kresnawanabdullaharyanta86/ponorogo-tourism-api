import { Elysia, t } from "elysia";

interface Wisata {
  id: number;
  nama: string;
  lokasi: string;
  kategori: string;
  hargaTiket: number;
  deskripsi: string;
  jamOperasional: string;
}

let nextId = 4;

const wisata: Wisata[] = [
  {
    id: 1,
    nama: "Telaga Ngebel",
    lokasi: "Kecamatan Ngebel, Ponorogo",
    kategori: "Wisata Alam",
    hargaTiket: 15000,
    deskripsi: "Destinasi wisata alam berupa telaga di kawasan Ngebel.",
    jamOperasional: "08.00-17.00",
  },
  {
    id: 2,
    nama: "Air Terjun Pletuk",
    lokasi: "Kecamatan Sooko, Ponorogo",
    kategori: "Wisata Alam",
    hargaTiket: 10000,
    deskripsi: "Air terjun yang berada di kawasan perbukitan.",
    jamOperasional: "08.00-16.00",
  },
  {
    id: 3,
    nama: "Alun-Alun Ponorogo",
    lokasi: "Pusat Kota Ponorogo",
    kategori: "Wisata Kota",
    hargaTiket: 0,
    deskripsi: "Ruang publik untuk bersantai dan menikmati suasana kota.",
    jamOperasional: "24 jam",
  },
];

const wisataSchema = t.Object({
  nama: t.String({ minLength: 1 }),
  lokasi: t.String({ minLength: 1 }),
  kategori: t.String({ minLength: 1 }),
  hargaTiket: t.Number({ minimum: 0 }),
  deskripsi: t.String(),
  jamOperasional: t.String({ minLength: 1 }),
});

const app = new Elysia()
  // GET: Memeriksa status API
  .get("/", () => ({
    success: true,
    message: "Ponorogo Tourism API berjalan melalui HTTPS.",
    protocol: "HTTPS",
    version: "1.0.0",
  }))

  // GET: Mengambil semua destinasi wisata
  .get("/api/wisata", () => ({
    success: true,
    total: wisata.length,
    data: wisata,
  }))

  // GET: Mengambil detail wisata berdasarkan ID
  .get(
    "/api/wisata/:id",
    ({ params, status }) => {
      const id = Number(params.id);

      if (!Number.isInteger(id) || id < 1) {
        return status(400, {
          success: false,
          message: "ID wisata harus berupa bilangan bulat positif.",
        });
      }

      const data = wisata.find((item) => item.id === id);

      if (!data) {
        return status(404, {
          success: false,
          message: "Destinasi wisata tidak ditemukan.",
        });
      }

      return {
        success: true,
        data,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // POST: Menambahkan destinasi wisata
  .post(
    "/api/wisata",
    ({ body, set }) => {
      const data: Wisata = {
        id: nextId++,
        ...body,
      };

      wisata.push(data);
      set.status = 201;

      return {
        success: true,
        message: "Destinasi wisata berhasil ditambahkan.",
        data,
      };
    },
    {
      body: wisataSchema,
    },
  )

  // PUT: Mengganti seluruh data destinasi
  .put(
    "/api/wisata/:id",
    ({ params, body, status }) => {
      const id = Number(params.id);

      if (!Number.isInteger(id) || id < 1) {
        return status(400, {
          success: false,
          message: "ID wisata tidak valid.",
        });
      }

      const index = wisata.findIndex((item) => item.id === id);

      if (index === -1) {
        return status(404, {
          success: false,
          message: "Destinasi wisata tidak ditemukan.",
        });
      }

      const data: Wisata = {
        id,
        ...body,
      };

      wisata[index] = data;

      return {
        success: true,
        message: "Seluruh data destinasi berhasil diperbarui.",
        data,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: wisataSchema,
    },
  )

  // PATCH: Memperbarui sebagian data destinasi
  .patch(
    "/api/wisata/:id",
    ({ params, body, status }) => {
      const id = Number(params.id);

      if (!Number.isInteger(id) || id < 1) {
        return status(400, {
          success: false,
          message: "ID wisata tidak valid.",
        });
      }

      const data = wisata.find((item) => item.id === id);

      if (!data) {
        return status(404, {
          success: false,
          message: "Destinasi wisata tidak ditemukan.",
        });
      }

      Object.assign(data, body);

      return {
        success: true,
        message: "Sebagian data destinasi berhasil diperbarui.",
        data,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Partial(wisataSchema),
    },
  )

  // DELETE: Menghapus destinasi wisata
  .delete(
    "/api/wisata/:id",
    ({ params, status }) => {
      const id = Number(params.id);

      if (!Number.isInteger(id) || id < 1) {
        return status(400, {
          success: false,
          message: "ID wisata tidak valid.",
        });
      }

      const index = wisata.findIndex((item) => item.id === id);

      if (index === -1) {
        return status(404, {
          success: false,
          message: "Destinasi wisata tidak ditemukan.",
        });
      }

      const deleted = wisata.splice(index, 1)[0];

      return {
        success: true,
        message: "Destinasi wisata berhasil dihapus.",
        data: deleted,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // CONNECT: Demonstrasi penerimaan HTTP CONNECT.
  // Ini bukan implementasi proxy tunnel.
  .route("CONNECT", "/api/connect-test", ({ set }) => {
    set.status = 200;

    return {
      success: true,
      method: "CONNECT",
      message:
        "Server menerima request CONNECT untuk keperluan demonstrasi.",
      note:
        "Endpoint ini tidak membuat tunnel TCP atau meneruskan koneksi proxy.",
    };
  });

// Jalankan server menggunakan HTTPS.
const server = app.listen({
  hostname: "0.0.0.0",
  port: 3000,
  tls: {
    cert: Bun.file("./certs/localhost.pem"),
    key: Bun.file("./certs/localhost-key.pem"),
  },
});

console.log("Ponorogo Tourism API berjalan di https://localhost:3000");
console.log("Tekan Ctrl+C untuk menghentikan server.");
