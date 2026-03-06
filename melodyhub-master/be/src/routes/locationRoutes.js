import express from 'express';
import axios from 'axios';

const router = express.Router();
const BASE_URL = 'https://esgoo.net/api-tinhthanh';

router.get('/provinces', async (req, res) => {
  try {
    const depth = parseInt(req.query.depth) || 2;

    // 1. Fetch provinces
    const provRes = await axios.get(`${BASE_URL}/1/0.htm`, { timeout: 10000 });
    if (provRes.data.error !== 0) throw new Error("API error");
    let provinces = provRes.data.data;

    // Transform variables to match frontend expectations (code -> id)
    // Esgoo returns: { id, name, ... }
    provinces = provinces.map(p => ({
      code: p.id,
      name: p.name,
      districts: []
    }));

    if (depth >= 2) {
      for (let prov of provinces) {
        const distRes = await axios.get(`${BASE_URL}/2/${prov.code}.htm`);
        if (distRes.data.error === 0) {
          prov.districts = distRes.data.data.map(d => ({
            code: d.id,
            name: d.name,
            wards: []
          }));

          if (depth >= 3) {
            for (let dist of prov.districts) {
              const wardRes = await axios.get(`${BASE_URL}/3/${dist.code}.htm`);
              if (wardRes.data.error === 0) {
                dist.wards = wardRes.data.data.map(w => ({
                  code: w.id,
                  name: w.name
                }));
              }
            }
          }
        }
      }
    }

    res.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error.response?.status || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      success: false,
      message: 'Không thể lấy danh sách tỉnh/thành từ API bên ngoài',
      error: error.message,
    });
  }
});

export default router;

