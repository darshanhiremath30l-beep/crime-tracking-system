// For index.html - citizen view
const map = L.map('map').setView([12.9716, 77.5946], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

async function loadNews() {
  let data = await fetch('http://localhost:8000/crimes?type=crime').then(r => r.json());
  let ul = document.getElementById('news-list');
  data.slice(-10).reverse().forEach(crime => {
    let li = document.createElement('li');
    li.textContent = crime.title + ': ' + crime.description;
    ul.appendChild(li);
    L.marker([crime.latitude, crime.longitude]).addTo(map)
      .bindPopup(`<b>${crime.title}</b><br/>${crime.description}${crime.media_url ? `<br/><img src="http://localhost:8000${crime.media_url}" width="100"/>` : ""}`);
  });
}