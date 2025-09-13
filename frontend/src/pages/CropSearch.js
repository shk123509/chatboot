import { useEffect, useState } from 'react';
import axios from 'axios';

function CropSearch(){
  const [query, setQuery] = useState('');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/farming/crops', { params: { search: query, limit: 12 } });
      if (res.data.success){
        setCrops(res.data.crops);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Browse Crops</h1>
      <div style={{ display:'flex', gap:8, margin:'12px 0' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search crops..." />
        <button onClick={search}>Search</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12 }}>
          {crops.map(c => (
            <div key={c._id} style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:12 }}>
              <h3 style={{ margin:0 }}>{c.name}</h3>
              <p style={{ margin:'6px 0' }}>Category: {c.category}</p>
              <p style={{ margin:'6px 0' }}>Season: {Array.isArray(c.season) ? c.season.join(', ') : c.season}</p>
              {c.commonIssues?.length ? <p>Issues: {c.commonIssues.length}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CropSearch;