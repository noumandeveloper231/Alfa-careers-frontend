let countriesCache = null;
let citiesCache = {};

export async function getCountries() {
  if (countriesCache) return countriesCache;
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3');
    if (!res.ok) throw new Error('Failed to fetch countries');
    const data = await res.json();
    countriesCache = data
      .map(c => ({ value: c.name.common, label: c.name.common }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return countriesCache;
  } catch {
    const fallback = [
      'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
      'India', 'Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman',
      'Kuwait', 'Bahrain', 'China', 'Japan', 'Singapore', 'Malaysia', 'Bangladesh', 'Sri Lanka'
    ];
    countriesCache = fallback.map(c => ({ value: c, label: c }));
    return countriesCache;
  }
}

export async function getCitiesForCountry(countryName) {
  if (!countryName) return [];
  if (citiesCache[countryName]) return citiesCache[countryName];
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    });
    const data = await res.json();
    if (!data.error && data.data?.length > 0) {
      const cities = data.data.sort((a, b) => a.localeCompare(b));
      citiesCache[countryName] = cities.map(c => ({ value: c, label: c }));
      return citiesCache[countryName];
    }
  } catch {}
  return getFallbackCities(countryName);
}



function getFallbackCities(countryName) {
  const map = {
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston', 'Washington'],
    'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Belfast', 'Leicester', 'Nottingham', 'Newcastle', 'Brighton', 'Southampton', 'Portsmouth', 'Reading', 'Oxford', 'Cambridge'],
    'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'St. John\'s', 'Kelowna', 'Barrie'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi'],
    'Pakistan': ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Hyderabad', 'Gujranwala', 'Peshawar', 'Quetta', 'Islamabad', 'Sargodha', 'Sialkot', 'Bahawalpur', 'Sukkur', 'Jhang', 'Sheikhupura', 'Larkana', 'Gujrat', 'Mardan', 'Kasur'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Dibba Al-Fujairah', 'Dibba Al-Hisn', 'Jebel Ali', 'Madinat Zayed', 'Ruwais', 'Liwa Oasis'],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Hofuf', 'Taif', 'Najran', 'Jubail', 'Abha', 'Yanbu', 'Al Qatif', 'Arar', 'Sakaka', 'Jizan', 'Dhahran'],
    'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster'],
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'],
    'China': ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Wuhan', 'Dongguan', 'Chongqing', 'Nanjing', 'Shenyang', 'Hangzhou', 'Xi\'an', 'Harbin', 'Suzhou', 'Qingdao', 'Dalian', 'Zhengzhou', 'Shantou', 'Jinan'],
    'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka'],
    'Singapore': ['Singapore', 'Jurong East', 'Woodlands', 'Tampines', 'Bedok', 'Sengkang', 'Hougang', 'Yishun', 'Choa Chu Kang', 'Punggol'],
    'Malaysia': ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Johor Bahru', 'Malacca City', 'Alor Setar', 'Seremban', 'Kuching', 'Kota Kinabalu', 'Kuantan', 'Kota Bharu', 'Kuala Terengganu', 'Sandakan', 'Tawau', 'Miri', 'Sibu', 'Klang', 'Subang Jaya'],
    'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur', 'Comilla', 'Gazipur', 'Narayanganj', 'Mymensingh', 'Jessore', 'Cox\'s Bazar', 'Bogra', 'Dinajpur', 'Pabna', 'Tangail', 'Jamalpur', 'Faridpur', 'Brahmanbaria'],
    'Qatar': ['Doha', 'Al Rayyan', 'Umm Salal', 'Al Wakrah', 'Al Khor', 'Mesaieed', 'Dukhan', 'Al Shamal', 'Al Shahaniya', 'Madinat ash Shamal'],
    'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Barka', 'Rustaq', 'Al Buraimi', 'Khasab'],
    'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Sabah Al Salem', 'Al Ahmadi', 'Al Farwaniyah', 'Al Jahra', 'Fahaheel', 'Mangaf', 'Abu Halifa'],
    'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'A\'ali', 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Al-Malikiyah'],
    'Sri Lanka': ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Negombo', 'Kandy', 'Kalmunai', 'Galle', 'Trincomalee', 'Batticaloa', 'Jaffna'],
  };
  const cities = map[countryName] || ['Capital City', 'Major City 1', 'Major City 2'];
  citiesCache[countryName] = cities.map(c => ({ value: c, label: c }));
  return citiesCache[countryName];
}
