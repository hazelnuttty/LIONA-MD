
  // Ambil data statistik API
  async function updateAPICards() {
    try {
      const res = await fetch("https://zelapioffciall.vercel.app/api-status/status");
      const json = await res.json();
      const data = json.result;

      document.getElementById("totalApi").textContent = data.totalfitur ?? "-";
      document.getElementById("totalRequests").textContent = data.totalrequest ?? "-";
      document.getElementById("avgResponse").textContent = data.avgResponseTime ?? "-";
      document.getElementById("successRate").textContent = data.successRate ?? "-";
      document.getElementById("errorRate").textContent = data.errorRate ?? "-";
    } catch (err) {
      console.error("Gagal ambil data dari API stats:", err);
    }
  }

  // Update pertama & setiap 60 detik
  updateAPICards();
  setInterval(updateAPICards, 60000);

  // ==== Grafik Latensi (infinite data) ====
  const ctx = document.getElementById("pingChart").getContext("2d");
const maxPoints = 50; // tampilkan 50 titik data terakhir aja

const pingData = {
  labels: [],
  datasets: [{
    label: "Server Latency",
    data: [],
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    tension: 0.3,
    fill: true,
  }]
};

const pingChart = new Chart(ctx, {
  type: "line",
  data: pingData,
  options: {
    animation: false,
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Waktu" },
        ticks: { maxRotation: 0, autoSkip: true }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Latency (ms)" }
      }
    },
    plugins: {
      legend: {
        labels: { font: { size: 10 } }
      }
    }
  }
});

function pingGoogle() {
  const start = performance.now();

  fetch("https://www.google.com/favicon.ico", {
    mode: "no-cors",
    cache: "no-store"
  }).finally(() => {
    const latency = Math.round(performance.now() - start);
    const timeLabel = new Date().toLocaleTimeString();

    // tambahkan data
    pingData.labels.push(timeLabel);
    pingData.datasets[0].data.push(latency);

    // auto-scroll: buang data lama kalau lewat batas
    if (pingData.labels.length > maxPoints) {
      pingData.labels.shift();
      pingData.datasets[0].data.shift();
    }

    pingChart.update();
  });
}

setInterval(pingGoogle, 1000); // ping tiap 3 detik
pingGoogle(); // panggil pertama
